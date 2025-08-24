const Users = require("../model/users");
const { bot } = require("./bot");
const { chooseSubscription, handleSubscriptionApproval } = require("./helper/sing-up-group");

bot.on("callback_query", async (query) => {
  const chatId = query.from.id;

  const { data } = query;
  let callbackName = data.split("_");

  bot
    .answerCallbackQuery(query.id, {
      show_alert: false,
      cache_time: 0.5,
    })
    .then(async () => {
      if (callbackName[0] == "sub") {
        chooseSubscription(query);
      }

      if (callbackName[0] == "confirm") {
        handleSubscriptionApproval(query);
      }
    })
    .catch((e) => {
      console.log(e.message);
    });
});
