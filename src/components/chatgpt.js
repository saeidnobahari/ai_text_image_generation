import { Configuration, OpenAIApi } from "openai";
import * as reader from 'xlsx'
import { useState, useEffect, useReducer } from 'react';
import { message, Upload, Button, Input, Select } from 'antd';
// import {readFileSync} from 'xlsx';
import { InboxOutlined, UserOutlined } from '@ant-design/icons';
import { openai_api_key } from '../constant/key';

import "./chatgpt.css"

const { TextArea } = Input;
const { Dragger } = Upload;

const DEFAULT_PARAMS = {
  "model": "text-davinci-003",
  "temperature": 0.7,
  "max_tokens": 4000,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}

const props = {
  name: 'file',
  multiple: true,

  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const ChatGPT = () => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [gptAnswer, setGptAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [prefixPrompt, setPrePrompt] = useState('Answer this question:')
  const [imagePrompt, setImagePrompt] = useState('')
  const [image_url, setImageUrl] = useState("#")
  const [prompt, setPrompt] = useState("");
  const [rresponse, setResponse] = useState("");

  const configuration = new Configuration({
    apiKey: process.env.React_APP_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    if(rresponse) {
      console.log("fetch Image", rresponse)
    }
  }, [rresponse])
  useEffect(() => {
    console.log("answer", answer)
    setGptAnswer(answer)
    setLoading(false)
  }, [answer])

  const generateImage = async () => {
    console.log("imageprompt", imagePrompt)

    const image_params = {
      "prompt" : imagePrompt,
      "n": 1,
      "size": "512x512",
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(openai_api_key)
      },
      body: JSON.stringify(image_params)
    };
    const response = await fetch('https://api.openai.com/v1/images/generations', requestOptions);
    const { data } = await response.json();
    if(data) {
      setImageUrl(data[0].url)
    }
  };

  const handleChange = (e) => {
    setQuestion(e.target.value)

  }
  const handleImagePrompt = (e) => {
    setImagePrompt(e.target.value)
  }

  const handleSelectChange = (value) => {
    setPrePrompt(value)
  }

  const generateAnswer = async () => {
    setLoading(true)
    console.log("question", question)
    const prompt = prefixPrompt + question
    const params = {
      "prompt": prompt
    }
    const params_ = { ...DEFAULT_PARAMS, ...params };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(openai_api_key)
      },
      body: JSON.stringify(params_)
    };
    const response = await fetch('https://api.openai.com/v1/completions', requestOptions);
    const data = await response.json();
    setAnswer(data.choices[0].text)
  }

  return (
    <div className='wrapper'>
      <div className='answer-wrapper mr-4'>
        <Select
          defaultValue="Answer the following content:"
          className='w-input mb-4'
          onChange={handleSelectChange}
          options={[
            {
              value: 'Answer the following content:',
              label: 'Answer the following content:',
            },
            {
              value: 'Rewrite the following content for student:',
              label: 'Rewrite the following content for student:',
            },
            {
              value: 'Summarize the following content:',
              label: 'Summarize the following content:',
            },
          ]}
        />
        <Input className='w-input mb-4' id='question' size="large" placeholder="Question" prefix={<UserOutlined />} onChange={handleChange} />
        <TextArea rows={12} className='w-input mb-4' placeholder="Answer of ChatGPT" value={gptAnswer} />
        <div className='button-wrapper'>
          <Button type="primary" loading={loading} onClick={generateAnswer}>Generate</Button>
        </div>
      </div>
      <div className='chatgpt-wrapper'>
        <Input className='w-input mb-4' id='question' size="large" placeholder="Question" prefix={<UserOutlined />} onChange={handleImagePrompt} />
        <img className="image" src={image_url} />
        <div className='button-wrapper'>
          <Button type="primary" loading={false} onClick={generateImage}>Generate Image</Button>
        </div>
      </div>
    </div>
  );
}
export default ChatGPT;