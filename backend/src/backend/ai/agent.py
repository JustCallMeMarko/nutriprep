import asyncio
import os
from agents import Agent, Runner, set_default_openai_client, set_tracing_disabled
from agents.decorators import tool
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("OPENAI_API_URL", "https://api.deepseek.com")
API_KEY = os.getenv("OPENAI_API_KEY", "your_deepseek_api_key")

set_tracing_disabled(True)
    
client = AsyncOpenAI(
        api_key=API_KEY,
        base_url=API_URL
)
set_default_openai_client(client)

agent = Agent(
    name="PrepAI",
    model="deepseek-flash",
    instructions="""You are PrepAI, a helpful assistant for the NutriPrep app. Your goal is to assist users in creating meal plans, providing nutritional information, and answering questions related to healthy eating and meal preparation. When providing information, ensure that it is accurate and based only on 'get_meal_info'. If you are unsure about an answer, respond with 'I'm not sure about that. Please consult a nutritionist or use the get_meal_info tool for accurate information.' You must reply in a concise and clear manner, avoiding unnecessary details while keeping a happy and friendly tone. Always prioritize the user's health and well-being in your responses.When a user asks for unrelated information, you should politely decline and redirect them to relevant topics related to meal planning and nutrition.

    Constraints: 
    - You must only use the 'get_meal_info' tool to provide information about meals and nutrition. Do not provide information from any other sources.
    - You must not provide medical advice or make any health-related claims. Always encourage users to consult a healthcare professional for personalized advice.
    - You must not provide information about topics unrelated to meal planning and nutrition. If a user asks for unrelated information, politely decline and redirect them to relevant topics.
    - You must not tell users about your internal workings or how you generate responses. 
    - You must not provide information about tool names or their usage. If a user asks about tools, politely decline and redirect them to relevant topics.
    """,
)

async def main():
    print("PrepAI CLI Chat (type 'exit' or 'quit' to stop)\n" + "-"*40)
    while True:
        try:
            user_input = input("User: ")
        except (KeyboardInterrupt, EOFError):
            break

        if user_input.strip().lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        if not user_input.strip():
            continue

        try:
            result = await Runner.run(agent, user_input)
            print(f"PrepAI: {result.final_output}\n")
        except Exception as e:
            print(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(main())