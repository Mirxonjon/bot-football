const { bot } = require("../bot");
const Users = require("../../model/users");
const {
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRu,
} = require("../menu/keyboard");

const sendSubscription = async (msg) => {
  const chatId = msg.from.id;
  let user = await Users.findOne({ chat_id: chatId }).lean();

  console.log("user", user);

  const textUz = `
🎉 Hurmatli foydalanuvchi!

📚 Bizning guruhimizga qo‘shilib, yangi bilim va foydali ma’lumotlardan bahramand bo‘ling.

💳 Obuna tariflari:
▫️ 1 oy — 100 000 so‘m
▫️ 3 oy — 250 000 so‘m
▫️ 1 yil — 800 000 so‘m

👉 Sizga qulay bo‘lgan tarifni tanlang va guruhimiz a’zosi bo‘ling! 👥
`;

  const textRu = `
🎉 Уважаемый пользователь!

📚 Присоединяйтесь к нашей группе и получайте новые знания и полезную информацию.

💳 Тарифы подписки:
▫️ 1 месяц — 100 000 сум
▫️ 3 месяца — 250 000 сум
▫️ 1 год — 800 000 сум

👉 Выберите удобный тариф и станьте участником нашей группы! 👥
`;

  await bot.sendMessage(chatId, user.language === "uz" ? textUz : textRu, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text:
              user.language === "uz"
                ? "🗓 1 oy — 100 000 so‘m"
                : "🗓 1 месяц — 100 000 сум",
            callback_data: "sub_1m",
          },
        ],
        [
          {
            text:
              user.language === "uz"
                ? "🗓 3 oy — 250 000 so‘m"
                : "🗓 3 месяца — 250 000 сум",
            callback_data: "sub_3m",
          },
        ],
        [
          {
            text:
              user.language === "uz"
                ? "🗓 1 yil — 800 000 so‘m"
                : "🗓 1 год — 800 000 сум",
            callback_data: "sub_12m",
          },
        ],
      ],
    },
  });
};

const chooseSubscription = async (query) => {
  const chatId = query.from.id;
  const messageId = query.message.message_id;

  let user = await Users.findOne({ chat_id: chatId }).lean();
  let admin = await Users.findOne({ username: "mirjalolborataliyev" }).lean();

  const lang = user?.language || "uz";

  let months, price;
  switch (query.data) {
    case "sub_1m":
      months = lang === "uz" ? "1 oy" : "1 месяц";
      price = lang === "uz" ? "100 000 so‘m" : "100 000 сум";
      break;
    case "sub_3m":
      months = lang === "uz" ? "3 oy" : "3 месяца";
      price = lang === "uz" ? "250 000 so‘m" : "250 000 сум";
      break;
    case "sub_12m":
      months = lang === "uz" ? "1 yil" : "1 год";
      price = lang === "uz" ? "800 000 so‘m" : "800 000 сум";
      break;
  }

  // foydalanuvchi ma’lumotini yangilaymiz
  user.plan = months;
  user.action = "payload_subscription";
  await Users.findByIdAndUpdate(user._id, user, { new: true });

  // tanlangan tugma qoladi, boshqalar ochiriladi
  const inline_keyboard = [
    [
      {
        text:
          query.data === "sub_1m"
            ? lang === "uz"
              ? "🗓 1 oy — 100 000 so‘m ✅"
              : "🗓 1 месяц — 100 000 сум ✅"
            : lang === "uz"
            ? "🗓 1 oy — 100 000 so‘m"
            : "🗓 1 месяц — 100 000 сум",
        callback_data: "sub_1m",
      },
    ],
    [
      {
        text:
          query.data === "sub_3m"
            ? lang === "uz"
              ? "🗓 3 oy — 250 000 so‘m ✅"
              : "🗓 3 месяца — 250 000 сум ✅"
            : lang === "uz"
            ? "🗓 3 oy — 250 000 so‘m"
            : "🗓 3 месяца — 250 000 сум",
        callback_data: "sub_3m",
      },
    ],
    [
      {
        text:
          query.data === "sub_12m"
            ? lang === "uz"
              ? "🗓 1 yil — 800 000 so‘m ✅"
              : "🗓 1 год — 800 000 сум ✅"
            : lang === "uz"
            ? "🗓 1 yil — 800 000 so‘m"
            : "🗓 1 год — 800 000 сум",
        callback_data: "sub_12m",
      },
    ],
  ];

  // Eski xabardagi inline keyboardni yangilash
  await bot.editMessageReplyMarkup(
    { inline_keyboard },
    { chat_id: chatId, message_id: messageId }
  );

  // yangi xabar matni
  const textUz = `
✅ Siz *${months}* tarifini tanladingiz. 

💳 To‘lov summasi: *${price}*

Karta raqami:
\`${admin?.cardNumber}\`

📸 Iltimos, to‘lovni amalga oshirgandan so‘ng *chekni yuboring*.
  `;

  const textRu = `
✅ Вы выбрали тариф *${months}*. 

💳 Сумма оплаты: *${price}*

Номер карты:
\`${admin?.cardNumber}\`

📸 Пожалуйста, после оплаты *отправьте чек*.
  `;

  // Pastidan yangi habar yuboramiz reply keyboard bilan
  await bot.sendMessage(chatId, lang === "uz" ? textUz : textRu, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: lang === "uz" ? "🔙 Menu" : "🔙 Меню" }]],
      resize_keyboard: true,
    },
  });
};

// 📌 Funksiya: User chek yuborganda ishlaydi
const handleUserPaymentCheck = async (msg) => {
  const chatId = msg.from.id;
  const fileId = msg.photo[msg?.photo?.length - 1].file_id; // eng katta rasm
  console.log("Chek yuborildi:", fileId);
  let user = await Users.findOne({ chat_id: chatId }).lean();
  if (!user || !user.plan) {
    return bot.sendMessage(
      chatId,
      user?.language === "uz"
        ? "❌ Avval obuna tarifini tanlang!"
        : "❌ Сначала выберите тариф!"
    );
  }

  // Admin userni topamiz (username orqali)
  const adminUser = await Users.findOne({
    username: "mirjalolborataliyev",
  }).lean();
  //   if (!adminUser) {
  //     return bot.sendMessage(chatId, "❌ Admin topilmadi.");
  //   }

  const lang = user.language || "uz";

  const captionUz = `
👤 Foydalanuvchi: @${msg.from.username || "-"}
🆔 ID: ${chatId}

📅 Tanlangan tarif: <b>${user.plan}</b>

📸 To‘lov cheki ilova qilindi.
`;

  const captionRu = `
👤 Пользователь: @${msg.from.username || "-"}
🆔 ID: ${chatId}

📅 Выбранный тариф: <b>${user.plan}</b>

📸 Чек об оплате приложен.
`;

  await bot.sendPhoto(adminUser.chat_id, fileId, {
    caption: lang === "uz" ? captionUz : captionRu,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text:
              lang === "uz" ? "✅ Tasdiqlash (1 oy)" : "✅ Подтвердить (1 мес)",
            callback_data: `confirm_approve_${chatId}_1m`,
          },
        ],
        [
          {
            text:
              lang === "uz" ? "✅ Tasdiqlash (3 oy)" : "✅ Подтвердить (3 мес)",
            callback_data: `confirm_approve_${chatId}_3m`,
          },
        ],
        [
          {
            text:
              lang === "uz"
                ? "✅ Tasdiqlash (1 yil)"
                : "✅ Подтвердить (1 год)",
            callback_data: `confirm_approve_${chatId}_12m`,
          },
        ],
        [
          {
            text: lang === "uz" ? "❌ Rad etish" : "❌ Отклонить",
            callback_data: `confirm_reject_${chatId}`,
          },
        ],
      ],
    },
  });

  await Users.findOneAndUpdate(
    { chat_id: chatId },
    { action: "menu" },
    { new: true }
  );

  await bot.sendMessage(
    chatId,
    lang === "uz"
      ? "✅ Chek yuborildi, To`lovingiz tasdiqlanish jarayonida! ⏳"
      : "✅ Чек отправлен, ваш платеж находится на стадии подтверждения! ⏳"
  );
};

const handleSubscriptionApproval = async (query) => {
  try {
    console.log("query", query);
    const [message, action, userId, plan] = query.data.split("_");
    console.log(message, action, userId, plan);
    let months, duration, sum;
    let startDate = new Date();
    let endDate = new Date();

    switch (plan) {
      case "1m":
        months = "1 oy";
        endDate.setMonth(endDate.getMonth() + 1);
        sum = 100000;
        break;

      case "3m":
        months = "3 oy";
        endDate.setMonth(endDate.getMonth() + 3);
        sum = 250000;
        break;

      case "12m":
        months = "1 yil";
        endDate.setFullYear(endDate.getFullYear() + 1);
        sum = 800000;
        break;
    }

    if (action === "approve") {
      await Users.findOneAndUpdate(
        { chat_id: userId },
        {
          plan: months,
          subscriptionStart: startDate,
          subscriptionEnd: endDate,
          access: true,
          totalPaid: sum,
        },
        { new: true }
      );

      // 5 minutlik invite link
      const inviteLink = await bot.createChatInviteLink(process.env.GROUP_ID, {
        expire_date: Math.floor(Date.now() / 1000) + 300, // 5 daqiqa
        member_limit: 1,
      });

      // userga habar
      await bot.sendMessage(
        userId,
        `✅ Sizning *${months}* tarif obunangiz tasdiqlandi!\n\n👥 Guruhga qo‘shilish uchun havola (5 daqiqa amal qiladi):\n${inviteLink.invite_link}`,
        { parse_mode: "Markdown" }
      );
    }

    if (action === "reject") {
      await bot.sendMessage(userId, "❌ Sizning to‘lovingiz rad etildi.");
    }

    // admin tugmalarini o‘chirish
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: query.message.chat.id, message_id: query.message.message_id }
    );
  } catch (err) {
    console.error("handleSubscriptionApproval error:", err.message);
  }
};

module.exports = {
  sendSubscription,
  chooseSubscription,
  handleUserPaymentCheck,
  handleSubscriptionApproval,
};
