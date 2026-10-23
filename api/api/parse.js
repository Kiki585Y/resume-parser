export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'POST') { return res.status(405).json({error:'只支持POST'}); }
  const { text } = req.body;
  const apiKey = process.env.DOUBAO_API_KEY;
  if (!apiKey) return res.status(500).json({error:'未配置API Key'});
  const prompt = `请从下面的简历文本中提取候选人信息，严格按照JSON格式返回，不要加任何其他解释：{"name":"姓名","phone":"手机号","email":"邮箱","age":"年龄数字","gender":"男/女","currentCompany":"最近工作公司","currentTitle":"最近职位","education":"大专/本科/硕士/博士","location":"现居城市","expectLocation":"期望工作城市"}，找不到的字段填空字符串。\n简历内容：\n${text.slice(0,8000)}`;
  try {
    const resp = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'ep-20261021205137-wfrnk',
        messages: [{role:'user', content: prompt}],
        temperature: 0.1
      })
    });
    const result = await resp.json();
    if(!result.choices){
      return res.status(500).json({error:'豆包接口返回错误: '+JSON.stringify(result)});
    }
    const content = result.choices[0].message.content;
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}') + 1;
    return res.status(200).json(JSON.parse(content.slice(start, end)));
  } catch(e) { return res.status(500).json({error:'解析失败: '+e.message}); }
}
