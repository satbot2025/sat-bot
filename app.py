from flask import Flask, render_template, request, jsonify
import openai

app = Flask(__name__)

# Replace with your OpenAI API key
openai.api_key = 'YOUR_OPENAI_API_KEY'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_message = request.json.get('message')
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are a helpful SAT tutor for kids."}, {"role": "user", "content": user_message}]
    )
    answer = response.choices[0].message['content']
    return jsonify({'answer': answer})

if __name__ == '__main__':
    app.run(debug=True)
