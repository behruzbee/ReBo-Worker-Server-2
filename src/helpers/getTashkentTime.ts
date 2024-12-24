import moment from 'moment-timezone';

export const getTashkentTime = () => {
    const scanTime = moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss');
    return scanTime
}