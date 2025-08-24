const Users = require("../model/users");
const { bot } = require("./bot");
const { start, chooseLanguage, requestContact } = require("./helper/start");
const { sendContact, sendVideoLesson } = require("./helper/send-contact-video");
const {
  sendSubscription,
  handleUserPaymentCheck,
} = require("./helper/sing-up-group");
const { editCard, editedCard } = require("./helper/card");
bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  console.log("msg", msg);
  const findUser = await Users.findOne({ chat_id: chatId }).lean();
  console.log("findUser", findUser);

  if (text == "/start" || text == "🔙 Menu") {
    console.log("findUser.action", findUser?.action);
    start(msg);
  }

  if (findUser && text != "/start" && text != "🔙 Menu") {
    if (findUser?.action == "choose_language") {
      chooseLanguage(msg);
    }

    if (findUser?.action == "request_contact") {
      requestContact(msg);
    }

    if (text == "☎️ Biz bilan aloqa" || text == "☎️ Связаться с нами") {
      sendContact(msg);
    }
    if (
      text == "😔 Obuna bo`lolmayapsizmi?" ||
      text == "😔 Не можете подписаться?"
    ) {
      sendVideoLesson(msg);
    }

    if (text == "🫂 Guruhga qo‘shilish!" || text == "👥 Вступить в группу!") {
      sendSubscription(msg);
    }
    if (text == "Karta" || text == "Карта") {
      editCard(msg);
    }

    if (findUser?.action == "payload_subscription") {
      handleUserPaymentCheck(msg);
    }

    if (findUser?.action == "edit_card") {
      editedCard(msg);
    }

    if (msg?.new_chat_members) {
      for (const member of msg.new_chat_members) {
        console.log("User qo‘shildi:", member.id);

        await Users.findOneAndUpdate(
          { chat_id: member.id },
          { join: true },
          { new: true }
        );
      }
    }

    if (msg?.left_chat_member) {
      const member = msg.left_chat_member;
      console.log("User chiqdi:", member.id);

      const user = await Users.findOne({ chat_id: member.id });

      if (user) {
        const now = new Date();

        if (user.subscriptionEnd && now < user.subscriptionEnd) {
          await Users.findOneAndUpdate(
            { chat_id: member.id },
            { join: false },
            { new: true }
          );
          console.log(
            "User chiqdi, obuna muddati tugamagan → join=false yangilandi"
          );
        } else {
          console.log(
            "User chiqdi, obuna muddati tugagan → yangilash shart emas"
          );
        }
      }
    }
  }
});
