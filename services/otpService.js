const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'shreyanayakb26@gmail.com', 
        pass: 'mahakali#2008' 
    },
    tls: {
        rejectUnauthorized: false 
    }
});


const sendOtp = async (email) => {
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false }); 

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions); 
        return otp; 
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; 
    }
};

module.exports = { sendOtp }; 
