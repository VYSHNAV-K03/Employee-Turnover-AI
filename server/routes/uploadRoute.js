const express = require("express");
const upload = require("../config/multerConfig");
const File = require("../models/fileModel");
const fs = require("fs");
const path = require("path");
const Employee = require("../models/Employee");
const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    const newFile = new File({ filePath, fileName, userId });
    await newFile.save();

    res.json(newFile);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Get latest file route
router.get("/latest", async (req, res) => {
  try {
    const latestFile = await File.findOne()
      .sort({
        uploadedDate: -1,
      })
      .populate("userId");
    if (!latestFile) return res.status(404).json({ message: "No file found." });

    // Read the file from the storage (example file path)
    const filePath = path.join("uploads", latestFile.fileName);
    const fileData = fs.readFileSync(filePath);

    // Send the file data back
    res.json({
      name: latestFile.fileName,
      type: "text/csv", // or "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" for Excel
      size: fileData.length,
      lastModified: Date.now(),
      data: fileData.toString("base64"),
      userId: latestFile.userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/store-employee", async (req, res) => {
  console.log(req.body);
  try {
    const newEmployee = new Employee(req.body.employeeDetails);
    await newEmployee.save();

    const email = req.body.filesender.email;

    // Prepare employee details text

    const employeeDetailsText = Object.entries(req.body.employeeDetails)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    // Send email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Attrition Employee Details",
    //   text: `Index ${req.body.index} and Details:${employeeDetailsText} `,
    // });

    res.status(200).json({ message: "Employee details stored in database" });
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(500).json({ error: "Failed to store employee data" });
  }
});

// send-email api

router.post("/send-email", async (req, res) => {
  try {
    const { emailcontent, filesender } = req.body;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: filesender.email,
      subject: "Attrition Email",
      text: emailcontent,
    });

    console.log(transporter);

    // Store in the Notification table
    await Notification.create({
      emailContent: emailcontent,
      fileSenderEmail: filesender.email,
    });

    res
      .status(200)
      .json({ message: "Email sent and notification saved successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email and save notification" });
  }
});


const transporter_another = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER_ANOTHER,
    pass: process.env.EMAIL_PASS_ANOTHER,
  },
});
router.post("/send-email/dummy_emp", async (req, res) => {
  try {
    const { emailcontent } = req.body;

    // Send email
    await transporter_another.sendMail({
      from: process.env.EMAIL_USER_ANOTHER,
      to: "employeeee65@gmail.com",
      subject: "Attrition Email",
      text: emailcontent,
    });

    // console.log(transporter);

    // Store in the Notification table

    res
      .status(200)
      .json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email" });
  }
});

router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Get notifications for a specific user
router.get("/notifications/:email", async (req, res) => {
  try {
    console.log(req.params);
    const { email } = req.params;
    const notifications = await Notification.find({
      fileSenderEmail: email,
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.put("/notifications/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Mark all notifications as read for a specific user
router.put("/notifications/mark-read/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await Notification.updateMany(
      { fileSenderEmail: email, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Route to get the count of unread notifications for a user
router.get("/notifications/unread/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const unreadCount = await Notification.countDocuments({
      fileSenderEmail: email,
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
});

module.exports = router;
