import { Context } from "npm:hono";

// 立春日期数据（用于准确计算生肖）
const springBeginDates: Record<number, [number, number]> = {
  2020: [2, 4], 2021: [2, 3], 2022: [2, 4], 2023: [2, 4], 2024: [2, 4],
  2025: [2, 3], 2026: [2, 4], 2027: [2, 4], 2028: [2, 4], 2029: [2, 3],
  2030: [2, 4], 2031: [2, 4], 2032: [2, 4], 2033: [2, 3], 2034: [2, 4],
  2035: [2, 4], 2036: [2, 4], 2037: [2, 3], 2038: [2, 4], 2039: [2, 4],
  2040: [2, 4],
};

// Calculate Chinese Zodiac based on Lichun (立春) date
function getChineseZodiac(date: Date): string {
  const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 获取该年的立春日期
  const springBegin = springBeginDates[year];
  
  if (!springBegin) {
    // 如果没有数据，使用简化算法（以2月4日为近似立春）
    const isBeforeSpring = month < 2 || (month === 2 && day < 4);
    const zodiacYear = isBeforeSpring ? year - 1 : year;
    return zodiacs[(zodiacYear - 1900) % 12];
  }
  
  const [springMonth, springDay] = springBegin;
  
  // 判断日期是否在立春之前
  const isBeforeSpring = 
    month < springMonth || 
    (month === springMonth && day < springDay);
  
  // 如果在立春之前，使用上一年的生肖
  const zodiacYear = isBeforeSpring ? year - 1 : year;
  
  return zodiacs[(zodiacYear - 1900) % 12];
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

function buildNamePrompt(gender: string, nameCount: number, surname: string, fatherName: string, motherName: string, year: number, month: number, day: number, birthTimeText: string, zodiac: string, element: string, westernZodiac: string, prefText: string, excludeNamesText: string, customExpectationText: string, nameLength: string, hasMultiplePreferences: boolean): string {
  let nameRequirement = "";
  let jsonFormat = "";
  
  let lengthRequirement = "";
  if (nameLength === "single") {
    lengthRequirement = "（必须全部为单字名，即：姓+1个字）";
  } else if (nameLength === "double") {
    lengthRequirement = "（必须全部为双字名，即：姓+2个字）";
  } else {
    const singleCount = Math.floor(nameCount / 2);
    const doubleCount = nameCount - singleCount;
    lengthRequirement = `（其中${singleCount}个为单字名，${doubleCount}个为双字名）`;
  }
  
  if (gender === "boy") {
    nameRequirement = `生成${nameCount}个男宝宝名字${lengthRequirement}`;
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
    nameRequirement = `生成${nameCount}个女宝宝名字${lengthRequirement}`;
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
    nameRequirement = `生成${nameCount}个男宝宝名字和${nameCount}个女宝宝名字${lengthRequirement.replace("个", "对")}`;
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

  return `作为一个专业的中国传统起名专家，请根据以下信息生成名字：

父亲姓名：${fatherName}
母亲姓名：${motherName}
宝宝出生日期：${year}年${month}月${day}日${birthTimeText}
生肖：${zodiac}
五行属性：${element}
星座：${westernZodiac}
姓氏：${surname}${prefText}${excludeNamesText}
${hasMultiplePreferences ? `
🔴🔴🔴 【重要】用户选择了多个偏好选项，请务必在生成的名字中体现多样性！
   - 如果用户选择了多个文化偏好（如"诗词经典、诸子百家"），名字列表中必须同时包含诗词经典相关的名字和诸子百家相关的名字
   - 如果用户选择了多个寓意方向（如"品德修养、才学智慧"），名字列表中需要同时体现不同的寓意方向
   - 请确保每个偏好类别都有代表性的名字，不要只偏向某一个选项
` : ''}
${customExpectationText ? `
⚠️ ⚠️ ⚠️ 【用户特别要求 - 最高优先级】⚠️ ⚠️ ⚠️
必须100%严格遵守：${customExpectationText}
这是最重要的要求，必须在生成每个名字时都遵守！
` : ''}
要求：
${customExpectationText ? `1. ⚠️ 【首要要求】${customExpectationText} - 这是最高优先级，必须100%严格遵守！
2. ` : '1. '}${nameRequirement}
${customExpectationText ? '3. ' : '2. '}${hasMultiplePreferences ? '🔴 【关键】当用户选择多个偏好时，必须生成多样化的名字列表，确保每个偏好类别都有代表！' : '严格遵循用户的偏好设置进行取名'}
${customExpectationText ? '4. ' : '3. '}每个名字必须包含：
   - 完整中文名（${surname}+名字）
   - 拼音
   - 对应的英文名
   - 详细解释（60-80字，必须含：五行属性 + 具体出处 + 寓意解析）
      ⚠️ 解释字段严格限制在80字以内，超过80字将被视为无效！
${customExpectationText ? '5' : '4'}. 名字需符合中国传统文化、五行平衡、生辰八字原理
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
   - 必须引用包含名字中字的原文（原文不超过20字）
   - 格式：源自《典籍·篇章》「原文引用」
   - ⚠️ 原文引用必须简短，不要复制整篇文章！
${customExpectationText ? '10' : '9'}. 必须严格按照以下JSON格式返回，不要添加任何其他文字：

${jsonFormat}

请直接返回JSON，不要有markdown标记或其他说明文字。`;
}

// Generate names using Deepseek API
export async function generateNames(c: Context) {
  try {
    const body = await c.req.json();
    const { fatherName, motherName, birthDate, birthTime, preferences, surnameChoice, previousNames, nameCount = 5, gender = "both", nameLength, babyGender } = body;
    
    // Debug log
    console.log("Received request body:", JSON.stringify(body, null, 2));

    if (!fatherName || !motherName) {
      console.error("Missing required fields:", { fatherName, motherName });
      return c.json({ error: "请填写完整的父母姓名" }, 400);
    }

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY environment variable");
      return c.json({ error: "服务暂时不可用，请稍后重试" }, 500);
    }

    // Parse birth date or use current date as default
    let birthDateObj: Date;
    let year: number;
    let month: number;
    let day: number;
    let zodiac: string;
    let element: string;
    let westernZodiac: string;
    
    if (birthDate) {
      birthDateObj = new Date(birthDate);
      year = birthDateObj.getFullYear();
      month = birthDateObj.getMonth() + 1;
      day = birthDateObj.getDate();
      zodiac = getChineseZodiac(birthDateObj);
      element = getFiveElements(year);
      westernZodiac = getWesternZodiac(month, day);
    } else {
      // Use current year for basic calculations if no birthDate provided
      const currentDate = new Date();
      year = currentDate.getFullYear();
      month = currentDate.getMonth() + 1;
      day = currentDate.getDate();
      zodiac = getChineseZodiac(currentDate);
      element = getFiveElements(year);
      westernZodiac = getWesternZodiac(month, day);
    }
    
    // Format birth time if provided
    let birthTimeText = "";
    if (birthTime) {
      birthTimeText = `\n出生时辰：${birthTime}`;
    }
    
    // Get Chinese cultural elements
    // zodiac, element, westernZodiac already calculated above

    // Extract surname based on user's choice
    const surname = (surnameChoice === "mother" ? motherName : fatherName).charAt(0);

    // Build preference text
    let prefText = "";
    const hasMultipleCultural = preferences?.cultural && preferences.cultural.length > 1;
    const hasMultipleMeaning = preferences?.meaning && preferences.meaning.length > 1;
    const hasMultipleStyle = preferences?.style && preferences.style.length > 1;

    if (preferences) {
      if (preferences.cultural && preferences.cultural.length > 0) {
        prefText += `\n经典文化偏好：${preferences.cultural.join('、')}${hasMultipleCultural ? '（需要生成与这些偏好相关的多种名字）' : ''}`;
      }
      if (preferences.meaning && preferences.meaning.length > 0) {
        prefText += `\n寓意方向：${preferences.meaning.join('、')}${hasMultipleMeaning ? '（需要生成与这些寓意相关的多种名字）' : ''}`;
      }
      if (preferences.style && preferences.style.length > 0) {
        prefText += `\n风格偏好：${preferences.style.join('、')}${hasMultipleStyle ? '（需要生成与这些风格相关的多种名字）' : ''}`;
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

    // Check if user selected multiple preferences
    const hasMultiplePreferences = (
      (preferences?.cultural && preferences.cultural.length > 1) ||
      (preferences?.meaning && preferences.meaning.length > 1) ||
      (preferences?.style && preferences.style.length > 1)
    );

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

    // 🚀 优化：合并三个分析请求为一次调用（方案一）
    const combinedMetadataPrompt = `请为${year}年${month}月${day}日出生的宝宝生成以下三段分析（每段用 ||| 分隔）：

【性格分析】
星座：${westernZodiac}
生肖：${zodiac}
五行：${element}

要求简洁优雅地描述性格特点、天赋才能和未来发展方向，融合中西方占星学精髓。返回分析文本，80字内。

【职业预测】
星座：${westernZodiac}
生肖：${zodiac}
五行：${element}

要求简洁优雅，结合五行八字和星座特点，预测适合的职业领域和发展方向。返回预测文本，30字内。

【兴趣爱好】
星座：${westernZodiac}
生肖：${zodiac}
五行：${element}

要求简洁优雅，结合五行八字和星座特点，预测可能喜欢的兴趣爱好和活动。返回预测文本，30字内。

请直接返回三段内容，严格按照以下格式（用 ||| 分隔）：
【性格分析】...内容...|||【职业预测】...内容...|||【兴趣爱好】...内容...`;

    console.log("Calling Deepseek API for combined metadata analysis...");

    // 🚀 优化：单次调用获取所有元数据（方案一）
    const metadataResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            content: "你是一个精通中西方占星学的专家，擅长结合生辰八字分析性格、职业和兴趣爱好。请严格按照要求的格式返回，用 ||| 分隔三段内容。"
          },
          {
            role: "user",
            content: combinedMetadataPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,  // 300+100+100，合并后总 token
      }),
    });

    // 解析合并的元数据结果
    let zodiacAnalysis = "";
    let career = "";
    let hobbies = "";

    if (metadataResponse.ok) {
      const metadataData = await metadataResponse.json();
      const content = metadataData.choices?.[0]?.message?.content?.trim() || "";

      // 使用 ||| 分隔符分割结果
      const parts = content.split('|||');
      if (parts.length >= 3) {
        zodiacAnalysis = parts[0].replace('【性格分析】', '').trim();
        career = parts[1].replace('【职业预测】', '').trim();
        hobbies = parts[2].replace('【兴趣爱好】', '').trim();
      } else {
        // 如果分割失败，降级使用原始内容
        console.warn('Failed to parse combined metadata, using fallback');
        zodiacAnalysis = content;
      }
    } else {
      console.error('Metadata API call failed:', metadataResponse.status);
    }

    console.log(`Parsed metadata - zodiac: ${zodiacAnalysis.length} chars, career: ${career.length} chars, hobbies: ${hobbies.length} chars`);

    // Call Deepseek API for names (this is the most time-consuming part)
    // If gender is "both" and nameCount is large, we split it into two parallel calls to avoid timeout
    let finalNamesData = { boyNames: [], girlNames: [] };

    if (gender === "both") {
      console.log(`Splitting generation for "both" genders with count ${nameCount}`);
      
      const [boyResponse, girlResponse] = await Promise.all([
        fetch("https://api.deepseek.com/v1/chat/completions", {
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
                content: buildNamePrompt("boy", nameCount, surname, fatherName, motherName, year, month, day, birthTimeText, zodiac, element, westernZodiac, prefText, excludeNamesText, customExpectationText, nameLength, hasMultiplePreferences)
              }
            ],
            temperature: 0.8,
            max_tokens: 3000,
          }),
        }),
        fetch("https://api.deepseek.com/v1/chat/completions", {
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
                content: buildNamePrompt("girl", nameCount, surname, fatherName, motherName, year, month, day, birthTimeText, zodiac, element, westernZodiac, prefText, excludeNamesText, customExpectationText, nameLength, hasMultiplePreferences)
              }
            ],
            temperature: 0.8,
            max_tokens: 3000,
          }),
        })
      ]);

      if (!boyResponse.ok || !girlResponse.ok) {
        console.error("Split generation failed:", { 
          boyStatus: boyResponse.status, 
          girlStatus: girlResponse.status 
        });
        throw new Error("名字生成调用失败");
      }

      const boyData = await boyResponse.json();
      const girlData = await girlResponse.json();

      if (!boyData.choices?.[0] || !girlData.choices?.[0]) {
        console.error("Invalid API response format in split mode", { boyData, girlData });
        throw new Error("API 响应格式错误");
      }

      const boyContent = boyData.choices[0].message.content.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "");
      const girlContent = girlData.choices[0].message.content.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "");

      try {
        const boyJson = JSON.parse(boyContent);
        const girlJson = JSON.parse(girlContent);
        finalNamesData.boyNames = boyJson.boyNames || [];
        finalNamesData.girlNames = girlJson.girlNames || [];
        console.log(`Parsed split results: ${finalNamesData.boyNames.length} boys, ${finalNamesData.girlNames.length} girls`);
      } catch (e) {
        console.error("Failed to parse split JSON results:", e, { boyContent, girlContent });
        throw new Error("名字解析失败");
      }
    } else {
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
              content: buildNamePrompt(gender, nameCount, surname, fatherName, motherName, year, month, day, birthTimeText, zodiac, element, westernZodiac, prefText, excludeNamesText, customExpectationText, nameLength, hasMultiplePreferences)
            }
          ],
          temperature: 0.8,
          max_tokens: nameCount > 5 ? 4000 : 3000,
        }),
      });

      if (!nameResponse.ok) {
        const errorText = await nameResponse.text();
        console.error("Deepseek API error response:", errorText);
        return c.json({ error: "名字生成服务暂时不可用，请稍后重试" }, 500);
      }

      const data = await nameResponse.json();
      
      if (!data.choices?.[0]) {
        console.error("Invalid API response format", data);
        throw new Error("API 响应格式错误");
      }

      let content = data.choices[0].message.content.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "");
      
      try {
        const parsed = JSON.parse(content);
        finalNamesData.boyNames = parsed.boyNames || [];
        finalNamesData.girlNames = parsed.girlNames || [];
        console.log(`Parsed single result: ${finalNamesData.boyNames.length} boys, ${finalNamesData.girlNames.length} girls`);
      } catch (e) {
        console.error("Failed to parse JSON result:", e, { content });
        throw new Error("名字解析失败");
      }
    }

    console.log("Deepseek API response processed successfully");

    // Clean and validate names data - truncate overly long explanations
    const cleanNamesArray = (names: any[]) => {
      if (!Array.isArray(names)) return [];
      return names.map(name => {
        if (name.explanation && name.explanation.length > 150) {
          console.warn(`Truncating overly long explanation for ${name.chineseName}: ${name.explanation.length} chars`);
          // Try to find a sentence break
          const truncated = name.explanation.substring(0, 120);
          const lastPeriod = Math.max(
            truncated.lastIndexOf('。'),
            truncated.lastIndexOf('，'),
            truncated.lastIndexOf('、')
          );
          name.explanation = lastPeriod > 60 
            ? truncated.substring(0, lastPeriod + 1) 
            : truncated + '...';
        }
        return name;
      });
    };
    
    // Clean both boyNames and girlNames
    finalNamesData.boyNames = cleanNamesArray(finalNamesData.boyNames);
    finalNamesData.girlNames = cleanNamesArray(finalNamesData.girlNames);

    // Return the generated names with additional info
    return c.json({
      names: {
        boyNames: finalNamesData.boyNames,
        girlNames: finalNamesData.girlNames,
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
