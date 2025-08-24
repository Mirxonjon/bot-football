const { bot } = require("../bot");
const Users = require("../../model/users");
const {
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRu,
} = require("../menu/keyboard");
const start = async (msg) => {
  const chatId = msg.from.id;

  let checkUser = await Users.findOne({ chat_id: chatId }).lean();

  if (checkUser?.language && checkUser?.phone) {
    await Users.findByIdAndUpdate(
      checkUser._id,
      { ...checkUser, action: "menu" },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      checkUser.language == "uz" ? `Menyuni tanlang` : `Выберите меню`,
      {
        reply_markup: {
          keyboard: checkUser.admin
            ? checkUser.language == "uz"
              ? adminKeyboardUZ
              : adminKeyboardRu
            : checkUser.language == "uz"
            ? userKeyboardUz
            : userKeyboardRU,
          resize_keyboard: true,
        },
      }
    );
  } else if (!checkUser) {
    let newUser = new Users({
      chat_id: chatId,
      admin: false,
      createdAt: new Date(),
      action: "choose_language",
    });
    await newUser.save();
    bot.sendMessage(
      chatId,
      `Здравствуйте ${msg.from.first_name} ,  добро пожаловать в наш бот. Выберите язык 🇷🇺/🇺🇿`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: `🇺🇿 O‘zbekcha`,
              },
              {
                text: `🇷🇺  Русский`,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  }
};

const chooseLanguage = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  console.log("user", user);
  if (`🇺🇿 O‘zbekcha` == text || `🇷🇺  Русский` == text) {
    user.language = text == `🇺🇿 O‘zbekcha` ? "uz" : "ru";
    user.action = "request_contact";

    await Users.findByIdAndUpdate(user._id, user, { new: true });
    bot.sendMessage(
      chatId,
      user.language == "uz"
        ? `📱Telefon raqamingizni jo'nating`
        : `📱Отправьте свой телефон номер`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Telefon raqamni yuborish",
                request_contact: true,
                one_time_keyboard: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    bot.sendMessage(chatId, `Выберите язык 🇷🇺/🇺🇿`, {
      reply_markup: {
        keyboard: [
          [
            {
              text: `🇺🇿 O‘zbekcha`,
            },
            {
              text: `🇷🇺  Русский`,
            },
          ],
        ],
        resize_keyboard: true,
      },
    });
  }
};

const requestContact = async (msg) => {
  const chatId = msg.from.id;
  let phonetext = msg.text;
  let user = await Users.findOne({ chat_id: chatId }).lean();
  const username = msg?.from?.username;
  if (msg?.contact?.phone_number) {
    phonetext = `+${+msg?.contact?.phone_number}`;
    if (
      phonetext?.includes("+99") &&
      !isNaN(+phonetext.split("+99")[1]) &&
      phonetext.length >= 13
    ) {
      const numbers = ["998933843484"];
      let usersAll = ["mirxonjon"];

      user.phone = phonetext;
      // user.admin = phonetext.includes('998981888857') ? phonetext.includes('998981888857') : phonetext.includes('998777773351')\
      user.admin = usersAll.includes(username?.toLowerCase());
      user.action = "menu";
      user.username = username?.toLowerCase();
      await Users.findByIdAndUpdate(user._id, user, { new: true });

      bot.sendMessage(
        chatId,
        user.language == "uz" ? `Menyuni tanlang ` : `Выберите меню `,
        {
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
        }
      );
    } else {
      bot.sendMessage(
        chatId,
        user.language == "uz"
          ? `📱Telefon raqamingizni jo'nating`
          : `📱Отправьте свой телефон номер`,
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text:
                    user.language == "uz"
                      ? "Telefon raqamni yuborish"
                      : `Отправить мой телефон номер`,
                  request_contact: true,
                  one_time_keyboard: true,
                },
              ],
            ],
            resize_keyboard: true,
          },
        }
      );
    }
  } else {
    bot.sendMessage(
      chatId,
      user.language == "uz"
        ? `📱Telefon raqamingizni jo'nating`
        : `📱Отправьте свой телефон номер`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Telefon raqamni yuborish",
                request_contact: true,
                one_time_keyboard: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  }
};

const logOut = async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const user = await Users.findOneAndDelete({ chat_id: userId });

    if (user) {
      await bot.sendMessage(
        chatId,
        "✅ Sizning hisobingiz muvaffaqiyatli o‘chirildi."
      );
    } else {
      await bot.sendMessage(chatId, "ℹ️ Siz avval ro‘yxatdan o‘tmagansiz.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    await bot.sendMessage(
      chatId,
      "❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring."
    );
  }
};

module.exports = {
  start,
  chooseLanguage,
  requestContact,
  logOut,
};
