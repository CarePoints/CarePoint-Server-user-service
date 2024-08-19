import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    
    service: 'gmail',
    auth: {
      user: 'akbarhaleel508@gmail.com', 
      pass: 'ejev ngqr qtxb khwn',
    },
  });
  

const otpSending = async (userEmail:string, otp:number) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to:userEmail,
        subject: 'Your OTP Code',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 8px 8px 0 0;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 20px 0;
                }
                .footer {
                    font-size: 12px;
                    color: #555555;
                    text-align: center;
                    padding: 10px 0;
                }
            </style>
            <title>OTP Code</title>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CarePoint</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your OTP code is:</p>
                    <div class="otp">${otp}</div>
                    <p>Please use this code to complete your verification.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} CarePoint. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP email');
    }
    
}

export default otpSending
