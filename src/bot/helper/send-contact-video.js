const { bot } = require("../bot");
const Users = require("../../model/users");
const {
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRu,
} = require("../menu/keyboard");

const sendContact = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  console.log("user", user);
  const contactTextUz = `
🤔 Savolingiz yoki taklifingiz bormi?
🫡 Unda biz bilan aloqaga chiqing!
✅ @geektv_admin ga yozing
`;

  const contactTextRu = `
🤔 У вас есть вопрос или предложение?
🫡 Тогда свяжитесь с нами!
✅ Напишите @geektv_admin
`;
  const imageUrl =
    "https://zorgle.co.uk/wp-content/uploads/2024/06/Learn-how-to-add-a-link-to-your-website-2048x1365.jpg";
  await bot.sendPhoto(chatId, imageUrl, {
    caption: user.language === "uz" ? contactTextUz : contactTextRu,
    reply_markup: {
      keyboard: user.admin
        ? user.language == "uz"
          ? adminKeyboardUZ
          : adminKeyboardRu
        : user.language == "uz"
        ? userKeyboardUz
        : userKeyboardRu,
      resize_keyboard: true,
    },
  });
};

const sendVideoLesson = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  console.log("user", user);
  const videoCaptionUz = `
Ushbu videoda 🎬 siz 📚 guruhimizga qanday qo'shilish haqida bilib olishingiz mumkin. 👥

`;

  const videoCaptionRu = `
В этом видео 🎬 вы узнаете 📚 как присоединиться к нашей группе. 👥
`;

  const videoUrl =
    "https://file-examples.com/storage/fef6248bef689f7bb9c274f/2017/04/file_example_MP4_480_1_5MG.mp4"; // <-- videong linkini shu yerga joylash kerak

  await bot.sendVideo(chatId, videoUrl, {
    caption: user.language === "uz" ? videoCaptionUz : videoCaptionRu,
    reply_markup: {
      keyboard: user.admin
        ? user.language == "uz"
          ? adminKeyboardUZ
          : adminKeyboardRu
        : user.language == "uz"
        ? userKeyboardUz
        : userKeyboardRu,
      resize_keyboard: true,
    },
  });
};

module.exports = {
  sendContact,
  sendVideoLesson,
};
