const cron = require("node-cron");
const Users = require("../model/users"); // sizdagi Users model
const {bot} = require("../bot/bot"); // bot instance
const { GROUP_ID } = process.env; // .env da group id bo‘lsin

// HAR 5 DАQIQАDА ISHLAYDIGAN CRON
cron.schedule("*/1 * * * *", async () => {
  try {
    const users = await Users.find({ access: true, join: false }).lean();
console.log("CRON ishga tushdi (1 daqiqa) - Foydalanuvchilar:", users.length);
    for (const user of users) {
      try {
        const invite = await bot.createChatInviteLink(GROUP_ID, {
          expire_date: Math.floor(Date.now() / 1000) + 300, // 5 minut
          member_limit: 1,
        });

        const text =
          user.language === "uz"
            ? `👥 Guruhga qo‘shilish uchun havola (5 daqiqa amal qiladi):\n${invite.invite_link}`
            : `👥 Ссылка для вступления в группу (действует 5 минут):\n${invite.invite_link}`;

        await bot.sendMessage(user.chat_id, text, {
          disable_web_page_preview: true,
        });
      } catch (err) {
        console.error("Link yuborishda xato:", err.message);
      }
    }
  } catch (e) {
    console.error("CRON xato:", e.message);
  }
});
// "5 0 * * *"
cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("🚀 CRON ishga tushdi (00:05)");

    const now = new Date();
    // Kecha tugaganlarni olish uchun
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    // faqat sanani solishtirish (soatlarni hisobga olmaslik uchun)
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    // Kecha tugagan obunachilar
    const expiredUsers = await Users.find({
      access: true,
      join: true,
      subscriptionEnd: { $gte: startOfYesterday, $lte: endOfYesterday },
    }).lean();
      console.log(`Kecha tugagan obunachilar soni: ${expiredUsers.length}`);

    for (const user of expiredUsers) {
      try {
        // Guruhdan chiqarish
        await bot.banChatMember(GROUP_ID, user.chat_id);
        await bot.unbanChatMember(GROUP_ID, user.chat_id);

        // DB yangilash
        await Users.findByIdAndUpdate(user._id, {
          access: false,
          join: false,
        });

        console.log(`⛔ Foydalanuvchi chiqarildi: ${user.chat_id}`);
      } catch (err) {
        console.error("Chiqarishda xato:", err.message);
      }
    }
  } catch (e) {
    console.error("CRON xato:", e.message);
  }
});
