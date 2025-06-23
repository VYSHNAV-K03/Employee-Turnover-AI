import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use a non-GUI backend suitable for scripts
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.preprocessing import LabelEncoder
import joblib
from sklearn.preprocessing import StandardScaler
import lime
from lime.lime_tabular import LimeTabularExplainer
import mpld3
from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.calibration import CalibratedClassifierCV # import the necessary class

#cors
import networkx as nx
from flask_cors import CORS

app = Flask(__name__)

CORS(app)



df = pd.read_csv('original_new.csv')

# Load the trained L-SVM model
lsvm_model = joblib.load("lsvm_model.pkl")

calibrated_lsvc= joblib.load("calibrated_lsvc_model.pkl")

columns_to_drop = ['EmployeeCount', 'Over18', 'StandardHours']
df_cleaned = df.drop(columns=columns_to_drop)



# Make a copy to avoid modifying original dataframe
df_encoded = df_cleaned.copy()

# Apply Label Encoding to each categorical column
le_dict = {}  # To store the encoders if needed later (e.g., for unseen data)
for col in ['Attrition', 'BusinessTravel', 'Department',
            'EducationField', 'Gender', 'JobRole',
            'MaritalStatus', 'OverTime']:
    le = LabelEncoder()
    df_encoded[col] = le.fit_transform(df_encoded[col])
    le_dict[col] = le  # Store encoder

scaler = MinMaxScaler()
data_scaled = pd.DataFrame(scaler.fit_transform(df_encoded), columns=df_encoded.columns)

from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split, cross_validate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Define features and target
X = data_scaled.drop(columns=['Attrition'])
y = data_scaled['Attrition']


# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the training data
scaler = StandardScaler() # Create a StandardScaler object
X_train_scaled = scaler.fit_transform(X_train) # Fit and transform the training data
X_test_scaled = scaler.transform(X_test) # Transform the test data using the fitted scaler


def get_similar_employees(data_scaled, employee_index, top_n=5):
    """
    Get similar employees using cosine similarity.
    
    Parameters:
    - data_scaled: Preprocessed and scaled data.
    - employee_index: Index of the employee to compare.
    - top_n: Number of similar employees to return.

    Returns:
    - List of dictionaries with similar employees and similarity scores.
    """
    # Get the instance of the selected employee
    instance = data_scaled.iloc[employee_index].values.reshape(1, -1)

    # Calculate cosine similarity between this instance and all other employees
    similarity_scores = cosine_similarity(instance, data_scaled.values)[0]

    # Create a dataframe with similarity scores
    similarity_df = pd.DataFrame({
        'index': range(len(similarity_scores)),
        'similarity': similarity_scores
    })

    # Remove the selected employee itself from the list
    similarity_df = similarity_df[similarity_df['index'] != employee_index]

    # Get the top N similar employees
    top_similar_employees = similarity_df.sort_values(by='similarity', ascending=False).head(top_n)

    # Get employee details for similar employees
    similar_employees_details = []
    for _, row in top_similar_employees.iterrows():
        similar_employee_index = int(row['index'])
        employee_data = data_scaled.iloc[similar_employee_index].to_dict()
        employee_data['similarity'] = round(row['similarity'], 4)  # Add similarity score
        similar_employees_details.append(employee_data)

    return similar_employees_details



@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files or 'index' not in request.form:
        return jsonify({'error': 'CSV file and employee index required'}), 400
    file = request.files['file']
    instance_index = int(request.form['index'])

    dff = pd.read_csv(file)

    # Define temporal features
    temporal_features = [
        "JobSatisfaction", "EnvironmentSatisfaction", "WorkLifeBalance",
        "YearsWithCurrManager", "YearsAtCompany", "YearsInCurrentRole"
    ]
    target_row = dff.loc[instance_index]

        # Create graph
    G = nx.Graph()
    G.add_node(instance_index)

    # ✅ Calculate connections before creating the graph
    connections = []
    for idx, row in dff.iterrows():
        if idx == instance_index:
            continue

        shared = [f for f in temporal_features if row[f] == target_row[f]]
        similarity = len(shared) / len(temporal_features)

        if similarity > 0:
            connections.append({
                "Connected Index": idx,
                "Connected EmployeeNumber": row["EmployeeNumber"],
                "Similarity Score": round(similarity, 2),
                "Shared Features": ", ".join(shared),
            })

    connections_df = pd.DataFrame(connections).sort_values(by="Similarity Score", ascending=False).reset_index(drop=True)
    #connections_df #Uncomment this to see data


    # ✅ Now iterate through connections_df
    for _, row in connections_df.iterrows():
        idx = row["Connected Index"]
        G.add_node(idx)
        G.add_edge(instance_index, idx)

    # Draw the graph
    pos = nx.spring_layout(G, seed=42)
    plt.figure(figsize=(14, 10))
    fig, ax = plt.subplots(figsize=(14, 10))

    nx.draw(
        G, pos,
        with_labels=True,
        node_size=1800,
        node_color="skyblue",
        font_size=10,
        font_weight='bold',
        edge_color="gray",
        # ax=ax
    )
    # plt.title(f"Temporal Graph for Index {instance_index} (Shared Features)", fontsize=16)
    # plt.axis("off")
    # plt.show()
    # ax.set_title(f"Temporal Graphh for Index {instance_index} (Shared Features)", fontsize=16)
    ax.set_axis_off()                 # Hides ticks and frame
    ax.set_xticks([])                # No x-axis ticks
    ax.set_yticks([])                # No y-axis ticks
    ax.set_frame_on(False)           # Hides border

    ax.axis("off")  # ✅ Disable axis on the Axes object
    
    html_graph = mpld3.fig_to_html(fig)
    plt.close(fig)


    connections = []

    for idx, row in dff.iterrows():
        if idx == instance_index:
            continue

        shared = [f for f in temporal_features if row[f] == target_row[f]]
        similarity = len(shared) / len(temporal_features)

        if similarity > 0:
            connections.append({
                "Name": row["Name "],
                "Connected Index": idx,
                "Connected EmployeeNumber": row["EmployeeNumber"],
                "Similarity Score": round(similarity, 2),
                "Shared Features": ", ".join(shared)
            })

    connections_df = pd.DataFrame(connections).sort_values(by="Similarity Score", ascending=False).reset_index(drop=True)
    # After creating connections_df
    connections_data = connections_df.to_dict(orient="records")


    columns_to_drop = ['EmployeeCount', 'Over18', 'StandardHours','Name ']
    dff_cleaned = dff.drop(columns=columns_to_drop)

    # Make a copy of the cleaned dataframe
    dff_encoded = dff_cleaned.copy()
    dff_original = dff.copy()
    columns_to_drop_original = ['EmployeeCount', 'Over18', 'StandardHours']
    dff_cleaned_original = dff_original.drop(columns=columns_to_drop_original)


    # Apply Label Encoding to each categorical column
    le_dict = {}  # Optional: store encoders for use with unseen data
    categorical_columns = ['BusinessTravel', 'Department',
                       'EducationField', 'Gender', 'JobRole',
                       'MaritalStatus', 'OverTime']

    for col in categorical_columns:
        le = LabelEncoder()
        dff_encoded[col] = le.fit_transform(dff_encoded[col])
        le_dict[col] = le

    scaler = MinMaxScaler()
    dff_scaled = pd.DataFrame(scaler.fit_transform(dff_encoded), columns=dff_encoded.columns)
    dff_scaled.shape

    # Select only the features used in training
    X_unseen = dff_scaled.drop(columns=['Attrition'], errors='ignore')

    # Scale the unseen data using the same scaler
    X_unseen_scaled = scaler.transform(X_unseen)

    # Predict Attrition
    unseen_predictions = lsvm_model.predict(X_unseen_scaled)

    # Add Predictions to the Unseen Data
    dff_scaled["Attrition_Predicted"] = unseen_predictions
    dff_cleaned_original["Attrition_Predicted"] = unseen_predictions


    # Show Results
    print(dff_scaled[["EmployeeNumber", "Attrition_Predicted"]])

    X_unseen = dff_scaled[X_train.columns]

    # ✅ Scale the unseen data using the same scaler
    X_unseen_scaled = scaler.transform(X_unseen)

    # ✅ Predict probabilities using the already trained model
    # Custom threshold
    threshold = 0.9

    # Predict probabilities
    unseen_probabilities = calibrated_lsvc.predict_proba(X_unseen_scaled)

    # Apply threshold manually
    final_attrition_predictions = (unseen_probabilities[:, 1] > threshold).astype(int)



    # Ensure unseen data has the same columns as training data
    X_unseen = dff_scaled[X_train.columns]

    # Scale the unseen data using the same scaler
    X_unseen_scaled = scaler.transform(X_unseen)

    # Define custom prediction function
    def custom_predict(X):
        probs = calibrated_lsvc.predict_proba(X)
        return np.column_stack([
            1 - (probs[:, 1] > threshold).astype(float),
            (probs[:, 1] > threshold).astype(float)
        ])


    # ✅ Create a LIME explainer (Use the original training data to initialize)
    explainer = LimeTabularExplainer(
        training_data=X_train_scaled,
        training_labels=y_train,
        mode="classification",
        class_names=["No Attrition", "Attrition"],
        feature_names=X_train.columns.tolist(),
        discretize_continuous=True,
        random_state=42
    )

    # ✅ Select an unseen employee for explanation (Example: 5th employee)
    instance = X_unseen_scaled[instance_index]

    # ✅ Generate explanation using LIME
    # Generate explanation using LIME
    explanation = explainer.explain_instance(
        instance,
        custom_predict,
        num_features=10 # Adjust number of features to show in explanation
    )

        # Convert explanation to HTML
    html_explanation = explanation.as_html()



    # Save the explanation as an HTML file
    with open("lime_explanation.html", "w", encoding="utf-8") as f:
        f.write(html_explanation)

    print("LIME explanation saved as lime_explanation.html")
    print(explanation.as_list())


    import re

    # Extract only positively contributing features (importance > 0)
    seen = set()
    ordered_features = []

    for desc, importance in explanation.as_list():
        if importance > 0:
            # Extract the feature name by removing thresholds/conditions
            cleaned = re.sub(r'^.*?([A-Za-z_][A-Za-z0-9_]+).*$', r'\1', desc)
            if cleaned not in seen:
                ordered_features.append(cleaned)
                seen.add(cleaned)

    # Convert to DataFrame (in original contribution order)
    Reasons = pd.DataFrame(ordered_features, columns=["Feature"])


    # Extract only the features contributing positively to 'Attrition' (orange-colored features)
    # attrition_reasons = [feature for feature, importance in explanation.as_list() if importance > 0]
    
    # Reasons = pd.DataFrame(attrition_reasons, columns=["Feature"])
    # print(Reasons)
    # Convert Reasons DataFrame to a list
    reasons_list = Reasons["Feature"].tolist()
    Attrition= bool(explanation.predict_proba[1] > 0.5)
    similar_employees = get_similar_employees(dff_scaled, instance_index, top_n=5)

    return jsonify({'explanation_html': html_explanation,
                     "graph_html": html_graph,
                     "connections": connections_data,
                     'attrition': Attrition,
                     'similar_employees': similar_employees,
                     'reasons': reasons_list,
                     'employee_data': dff_cleaned_original.iloc[instance_index].to_dict()
                     }), 200

if __name__ == '__main__':
    app.run(debug=True)