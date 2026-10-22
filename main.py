from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, httpx, json

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ResumeText(BaseModel):
    text: str

@app.post("/api/parse-resume")
async def parse_resume(resume: ResumeText):
    api_key = os.getenv("DOUBAO_API_KEY")
    if not api_key: return {"error": "未配置API Key"}
    prompt = f'''请从简历文本中提取信息，严格返回JSON，不要其他解释：{{"name":"姓名","phone":"手机号","email":"邮箱","age":"年龄","gender":"男/女","currentCompany":"最近公司","currentTitle":"最近职位","education":"大专/本科/硕士/博士","location":"现居城市","expectLocation":"期望城市"}}，找不到的字段填空字符串。简历内容：{resume.text[:8000]}'''
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post("https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "doubao-pro-4k", "messages": [{"role":"user","content":prompt}], "temperature":0.1})
        result = resp.json()["choices"][0]["message"]["content"]
        start, end = result.find("{"), result.rfind("}")+1
        return json.loads(result[start:end])

@app.get("/")
def health(): return {"status": "ok"}
