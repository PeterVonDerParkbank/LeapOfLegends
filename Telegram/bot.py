from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from dotenv import load_dotenv
import os

# Lade Token aus .env
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            InlineKeyboardButton(
                "Launch Leap of Legends", 
                web_app=WebAppInfo(url="https://marsloeller.com")
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    image_path = "./TitleBild.png"

    message_text = (
        "Welcome to *Leap of Legends* by [Olympus Prime](https://x.com/OlympusPr1me)! \n\n"
        "You have been *trapped* for what feels like forever, held *prisoner* in the *Cyclops*' dark, stony cave. 🐑\n\n" 
        "Heart pounding, you seize your chance and *sprint* toward the cave’s entrance, each step faster than the last, the *light of freedom* just within reach. 🔆\n\n" 
        "*Try to reach the highest platform before the Cyclops catches you!* 😈"        
    )

    with open(image_path, 'rb') as photo:
        await update.message.reply_photo(photo=photo)
    
    await update.message.reply_text(
        message_text,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

if __name__ == '__main__':
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling()