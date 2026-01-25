import { Context } from "npm:hono";

// Calculate Chinese Zodiac
function getChineseZodiac(year: number): string {
  const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return zodiacs[(year - 1900) % 12];
}

// Calculate Five Elements (simplified version based on birth year)
function getFiveElements(year: number): string {
  const elements = ["金", "木", "水", "火", "土"];
  return elements[year % 5];
}

// Calculate Western Zodiac
function getWesternZodiac(month: number, day: number): string {
  const zodiacs = [
    { name: "摩羯座", end: [1, 19] },
    { name: "水瓶座", end: [2, 18] },
    { name: "双鱼座", end: [3, 20] },
    { name: "白羊座", end: [4, 19] },
    { name: "金牛座", end: [5, 20] },
    { name: "双子座", end: [6, 21] },
    { name: "巨蟹座", end: [7, 22] },
    { name: "狮子座", end: [8, 22] },
    { name: "处女座", end: [9, 22] },
    { name: "天秤座", end: [10, 23] },
    { name: "天蝎座", end: [11, 22] },
    { name: "射手座", end: [12, 21] },
    { name: "摩羯座", end: [12, 31] },
  ];

  for (let i = 0; i < zodiacs.length; i++) {
    const [endMonth, endDay] = zodiacs[i].end;
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return zodiacs[i].name;
    }
  }
  return "摩羯座";
}

// Generate names using Deepseek API
export async function generateNames(c: Context) {
  try {
    const body = await c.req.json();
    const { fatherName, motherName, birthDate, birthTime, preferences, surnameChoice, previousNames, nameCount = 5, gender = "both" } = body;
    
    // Debug log
    console.log("Received request body:", JSON.stringify(body, null, 2));

    if (!fatherName || !motherName || !birthDate) {
      console.error("Missing required fields:", { fatherName, motherName, birthDate });
      return c.json({ error: "请填写完整的父母姓名和宝宝出生日期" }, 400);
    }

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY environment variable");
      return c.json({ error: "服务暂时不可用，请稍后重试" }, 500);
    }

    // Parse birth date
    const birthDateObj = new Date(birthDate);
    const year = birthDateObj.getFullYear();
    const month = birthDateObj.getMonth() + 1;
    const day = birthDateObj.getDate();
    
    // Format birth time if provided
    let birthTimeText = "";
    if (birthTime) {
      birthTimeText = `\n出生时辰：${birthTime}`;
    }
    
    // Get Chinese cultural elements
    const zodiac = getChineseZodiac(year);
    const element = getFiveElements(year);
    const westernZodiac = getWesternZodiac(month, day);

    // Extract surname based on user's choice
    const surname = (surnameChoice === "mother" ? motherName : fatherName).charAt(0);

    // Build preference text
    let prefText = "";
    if (preferences) {
      if (preferences.cultural && preferences.cultural.length > 0) {
        prefText += `\n经典文化偏好：${preferences.cultural.join('、')}`;
      }
      if (preferences.meaning && preferences.meaning.length > 0) {
        prefText += `\n寓意方向：${preferences.meaning.join('、')}`;
      }
      if (preferences.style && preferences.style.length > 0) {
        prefText += `\n风格偏好：${preferences.style.join('、')}`;
      }
      if (preferences.element && preferences.element.length > 0) {
        prefText += `\n五行补益：${preferences.element.join('、')}`;
      }
    }
    
    // Build custom expectation separately for emphasis
    let customExpectationText = "";
    if (preferences?.customExpectation && preferences.customExpectation.trim()) {
      customExpectationText = preferences.customExpectation.trim();
    }
    
    console.log("Built preference text:", prefText || "(none)");
    console.log("Custom expectation:", customExpectationText || "(none)");

    // Build previous names exclusion text
    let excludeNamesText = "";
    if (previousNames && previousNames.length > 0) {
      excludeNamesText = `\n\n特别注意：以下名字已经生成过，请避免重复，生成全新的名字：\n${previousNames.join('、')}`;
    }

    // Construct prompt for Deepseek - including zodiac analysis
    const analysisPrompt = `请为${year}年${month}月${day}日出生的宝宝生成星座性格分析（80字内），包括：
1. 星座：${westernZodiac}
2. 生肖：${zodiac}
3. 五行：${element}

要求简洁优雅地描述性格特点、天赋才能和未来发展方向，融合中西方占星学精髓。直接返回分析文本，不要标题。`;

    const careerPrompt = `基于以下信息，预测宝宝未来的职业倾向（30字内）：
星座：${westernZodiac}
生肖：${zodiac}
五行：${element}
出生日期：${year}年${month}月${day}日${birthTimeText}

要求简洁优雅，结合五行八字和星座特点，预测适合的职业领域和发展方向。直接返回预测文本，不要标题。`;

    const hobbiesPrompt = `基于以下信息，预测宝宝可能的兴趣爱好（30字内）：
星座：${westernZodiac}
生肖：${zodiac}
五行：${element}
出生日期：${year}年${month}月${day}日${birthTimeText}

要求简洁优雅，结合五行八字和星座特点，预测可能喜欢的兴趣爱好和活动。直接返回预测文本，不要标题。`;

    // Build name generation requirement based on gender
    let nameRequirement = "";
    let jsonFormat = "";
    
    if (gender === "boy") {
      nameRequirement = `生成${nameCount}个男宝宝名字`;
      jsonFormat = `{
  "boyNames": [
    {
      "chineseName": "姓名",
      "pinyin": "xing ming",
      "englishName": "Name",
      "explanation": "属X，源自《XX·篇章》「包含名字中字的原文引用」，寓意..."
    }
  ]
}`;
    } else if (gender === "girl") {
      nameRequirement = `生成${nameCount}个女宝宝名字`;
      jsonFormat = `{
  "girlNames": [
    {
      "chineseName": "姓名",
      "pinyin": "xing ming",
      "englishName": "Name",
      "explanation": "属X，源自《XX·篇章》「包含名字中字的原文引用」，寓意..."
    }
  ]
}`;
    } else {
      nameRequirement = `生成${nameCount}个男宝宝名字和${nameCount}个女宝宝名字`;
      jsonFormat = `{
  "boyNames": [
    {
      "chineseName": "姓名",
      "pinyin": "xing ming",
      "englishName": "Name",
      "explanation": "属X，源自《XX·篇章》「包含名字中字的原文引用」，寓意..."
    }
  ],
  "girlNames": [
    {
      "chineseName": "姓名",
      "pinyin": "xing ming",
      "englishName": "Name",
      "explanation": "属X，源自《XX·篇章》「包含名字中字的原文引用」，寓意..."
    }
  ]
}`;
    }

    const namePrompt = `作为一个专业的中国传统起名专家，请根据以下信息生成名字：

父亲姓名：${fatherName}
母亲姓名：${motherName}
宝宝出生日期：${year}年${month}月${day}日${birthTimeText}
生肖：${zodiac}
五行属性：${element}
星座：${westernZodiac}
姓氏：${surname}${prefText}${excludeNamesText}
${customExpectationText ? `
⚠️ ⚠️ ⚠️ 【用户特别要求 - 最高优先级】⚠️ ⚠️ ⚠️
必须100%严格遵守：${customExpectationText}
这是最重要的要求，必须在生成每个名字时都遵守！
` : ''}
要求：
${customExpectationText ? `1. ⚠️ 【首要要求】${customExpectationText} - 这是最高优先级，必须100%严格遵守！
2. ` : '1. '}${nameRequirement}
${customExpectationText ? '3. ' : '2. '}每个名字必须包含：
   - 完整中文名（${surname}+名字）
   - 拼音
   - 对应的英文名
   - 详细解释（80字内，必须��含：五行属性 + 具体出处 + 寓意解析）
${customExpectationText ? '4' : '3'}. 名字需符合中国传统文化、五行平衡、生辰八字原理
${customExpectationText ? '5' : '4'}. 严格遵循用户的偏好设置进行取名
${customExpectationText ? '6' : '5'}. 寓意美好、音韵优美、易读易记
${customExpectationText ? '7' : '6'}. 英文名可以是音译或意境对应的英文名
${customExpectationText ? '8' : '7'}. 🔴【关键要求】出处必须与名字中的具体字有直接关联！
   - 例如：名字"思齐"必须源自《诗经·大雅·思齐》"思齐大任，文王之母"
   - 例如：名字"修远"必须源自《楚辞·离骚》"路漫漫其修远兮，吾将上下而求索"
   - 例如：名字"君行"必须源自《易经·乾卦》"天行健，君子以自强不息"
   - 例如：名字"明德"必须源自《大学》"大学之道，在明明德"
   - 不要生成与出处无关的名字！名字的字必须出现在引用的原文中！
${customExpectationText ? '9' : '8'}. 出处格式要求：
   - 必须精确到具体篇章
   - 必须引用包含名字中字的原文
   - 格式：源自《典籍·篇章》"原文引用（必须包含名字中的字）"
${customExpectationText ? '10' : '9'}. 必须严格按照以下JSON格式返回，不要添加任何其他文字：

${jsonFormat}

请直接返回JSON，不要有markdown标记或其他说明文字。`;

    console.log("Calling Deepseek API for zodiac analysis, career, hobbies and names...");

    // Call Deepseek API for zodiac analysis
    const analysisResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个精通中西方占星学的专家，擅长结合生辰八字和星座分析性格与命运。"
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    let zodiacAnalysis = "";
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      zodiacAnalysis = analysisData.choices?.[0]?.message?.content?.trim() || "";
    }

    // Call Deepseek API for career prediction
    const careerResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个精通中西方占星学的专家，擅长根据生辰八字预测职业倾向。"
          },
          {
            role: "user",
            content: careerPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    let career = "";
    if (careerResponse.ok) {
      const careerData = await careerResponse.json();
      career = careerData.choices?.[0]?.message?.content?.trim() || "";
    }

    // Call Deepseek API for hobbies prediction
    const hobbiesResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个精通中西方占星学的专家，擅长根据生辰八字预测兴趣爱好。"
          },
          {
            role: "user",
            content: hobbiesPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    let hobbies = "";
    if (hobbiesResponse.ok) {
      const hobbiesData = await hobbiesResponse.json();
      hobbies = hobbiesData.choices?.[0]?.message?.content?.trim() || "";
    }

    // Call Deepseek API for names
    const nameResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的中国传统起名专家，精通五行八字、诗词典故。请始终返回有效的JSON格式数据，不要添加任何markdown标记或额外说明。"
          },
          {
            role: "user",
            content: namePrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!nameResponse.ok) {
      const errorText = await nameResponse.text();
      console.error("Deepseek API error response:", errorText);
      return c.json({ 
        error: "名字生成服务暂时不可用，请稍后重试" 
      }, 500);
    }

    const data = await nameResponse.json();
    console.log("Deepseek API response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response structure:", data);
      return c.json({ error: "服务响应异常，请重试" }, 500);
    }

    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Parse the JSON response
    let namesData;
    try {
      namesData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response:", content);
      return c.json({ 
        error: "名字生成失败，请重试" 
      }, 500);
    }

    // Validate response based on gender
    if (gender === "boy") {
      if (!namesData.boyNames || !Array.isArray(namesData.boyNames)) {
        console.error("Invalid boy names structure in response:", namesData);
        return c.json({ error: "名字生成失败，请重试" }, 500);
      }
      // Ensure girlNames array exists (empty)
      namesData.girlNames = namesData.girlNames || [];
    } else if (gender === "girl") {
      if (!namesData.girlNames || !Array.isArray(namesData.girlNames)) {
        console.error("Invalid girl names structure in response:", namesData);
        return c.json({ error: "名字生成失败，请重试" }, 500);
      }
      // Ensure boyNames array exists (empty)
      namesData.boyNames = namesData.boyNames || [];
    } else {
      if (!namesData.boyNames || !Array.isArray(namesData.boyNames) || !namesData.girlNames || !Array.isArray(namesData.girlNames)) {
        console.error("Invalid names structure in response:", namesData);
        return c.json({ error: "名字生成失败，请重试" }, 500);
      }
    }

    // Return the generated names with additional info
    return c.json({
      names: {
        boyNames: namesData.boyNames,
        girlNames: namesData.girlNames,
      },
      metadata: {
        zodiac,
        element,
        westernZodiac,
        birthDate: `${year}年${month}月${day}日`,
        zodiacAnalysis,
        career,
        hobbies,
      },
    });

  } catch (error) {
    console.error("Error in generateNames:", error);
    return c.json({ 
      error: "服务暂时不可用，请稍后重试" 
    }, 500);
  }
}