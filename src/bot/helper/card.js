const { bot } = require("../bot");
const Users = require("../../model/users");
const {
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRu,
} = require("../menu/keyboard");

const editCard = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  console.log("user", user);

  if (user?.username == "mirjalolborataliyev") {
    user.action = "edit_card";
    await Users.findByIdAndUpdate(user._id, user, { new: true });

    const TextUz = `
💳 Kartani yangilash

Iltimos, yangi karta raqamingizni yuboring. 
📌 Namuna: 1234 5678 9012 3456 (16 ta raqam)
`;

    const TextRu = `
💳 Обновление карты

Пожалуйста, отправьте новый номер вашей карты. 
📌 Пример: 1234 5678 9012 3456 (16 цифр)
`;

    bot.sendMessage(chatId, user.language == "uz" ? TextUz : TextRu, {
      reply_markup: {
        keyboard: [
          [
            {
              text: user.language === "uz" ? "🔙 Orqaga" : "🔙 Назад",
            },
          ],
        ],

        resize_keyboard: true,
      },
    });
  } else {
    const TextUz = `❌ Kechirasiz, bu bo'lim faqat adminlar uchun.`;

    const TextRu = `❌ Извините, этот раздел доступен только администраторам.`;
    bot.sendMessage(chatId, user.language == "uz" ? TextUz : TextRu, {
      reply_markup: {
        keyboard: user.language == "uz" ? adminKeyboardUZ : adminKeyboardRu,
        resize_keyboard: true,
      },
    });
  }
};

const editedCard = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  console.log("user", user);

  if (text === "🔙 Orqaga" || text === "🔙 Назад") {
    user.action = "menu";
    await Users.findByIdAndUpdate(user._id, user, { new: true });

    bot.sendMessage(
      chatId,
      user.language == "uz" ? `Menyuni tanlang ` : `Выберите меню `,
      {
        reply_markup: {
          keyboard: user.language == "uz" ? adminKeyboardUZ : adminKeyboardRu,
          resize_keyboard: true,
        },
      }
    );
  } else {
    if (user?.username == "mirjalolborataliyev") {
      user.action = "menu";
      user.cardNumber = text;
      await Users.findByIdAndUpdate(user._id, user, { new: true });

      const textUz = `✅ Karta muvaffaqiyatli yangilandi!`;

      const textRu = `✅ Карта успешно обновлена!`;

      await bot.sendMessage(chatId, user.language === "uz" ? textUz : textRu, {
        reply_markup: {
          keyboard: user.language == "uz" ? adminKeyboardUZ : adminKeyboardRu,
          resize_keyboard: true,
        },
      });

      const allUsers = await Users.find({});
      const notifyTextUz = `
❗️Diqqat! Karta raqami yangilandi.
Endilikda barcha to‘lovlar faqat quyidagi karta raqamiga amalga oshirilishi kerak:
${text}
Agar boshqa kartaga to‘lov qilinsa, bu to‘lov qabul qilinmaydi.
Iltimos, e’tiborli bo‘ling.
`;

      const notifyTextRu = `
❗️Внимание! Номер карты был обновлен.
Теперь все платежи должны осуществляться только на следующую карту:
${text}
Если перевод будет сделан на другую карту, он не будет принят.
Пожалуйста, будьте внимательны.
`;

      for (const u of allUsers) {
        try {
          await bot.sendMessage(
            u.chat_id,
            u.language === "uz" ? notifyTextUz : notifyTextRu
          );
        } catch (err) {
          console.log("Xabar yuborishda xato:", err.message);
        }
      }
    } else {
      const TextUz = `❌ Kechirasiz, bu bo'lim faqat adminlar uchun.`;

      const TextRu = `❌ Извините, этот раздел доступен только администраторам.`;
      bot.sendMessage(chatId, user.language == "uz" ? TextUz : TextRu, {
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
    }
  }
};

module.exports = {
  editCard,
  editedCard,
};
