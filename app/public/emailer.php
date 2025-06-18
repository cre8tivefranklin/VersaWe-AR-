<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    // Sanitize and validate input (basic example)
    $name = htmlspecialchars(trim($name));
    $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($message));

    // Basic validation
    if (empty($name) || empty($email) || empty($message)) {
        echo "Please fill in all required fields.";
        exit; // Stop execution
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Email parameters
    $to = "sami@versawear.org"; // Replace with your email address
    $subject = "New Contact Form Submission";
    $email_body = "Name: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Message: $message";

    // Send email using mail()
    $headers = "From: $name <$email>"; // Set the "From" header

    if (mail($to, $subject, $email_body, $headers)) {
        echo "Thank you for your message! We will get back to you shortly.";
    } else {
        echo "Oops! Something went wrong. Please try again later.";
    }
} else {
    // If accessed directly, redirect or show an error
    echo "Access denied.";
}
?>
