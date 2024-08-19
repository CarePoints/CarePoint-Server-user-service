export const generateOtpWithTime = () =>{
    const digit1 = Math.floor(Math.random() * 9) + 1;
    const digit2 = Math.floor(Math.random() * 9) + 1;
    const digit3 = Math.floor(Math.random() * 9) + 1;
    const digit4 = Math.floor(Math.random() * 9) + 1;

    const otp = parseInt(`${digit1}${digit2}${digit3}${digit4}`, 10)
    const creationTime = new Date();
    return {otp, creationTime}
}