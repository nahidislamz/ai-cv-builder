import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export const getGroqChatCompletion = async (prompt,max_tokens) => {
    return groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 1,
        max_tokens: max_tokens,
        top_p: 1,
        stream: false,
        stop: null,
    });
};

// utils.js
export const generateSuggestedContent = async (prompt) => {
    try {
        const response = await getGroqChatCompletion(prompt, 200); // Set max_tokens as per need
        if (response?.choices?.[0]?.message?.content) {
            return response.choices[0].message.content.trim();
        }
        return '';
    } catch (error) {
        console.error('Error generating content:', error);
        return 'Unable to generate content at this time.';
    }
};


export const parseCvData = (text) => {
    // Simple parsing logic based on patterns; customize for your file format
    const personalInfo = {
        name: text.match(/Name:\s*(.*)/i)?.[1] || '',
        email: text.match(/Email:\s*(.*)/i)?.[1] || '',
        phone: text.match(/Phone:\s*(.*)/i)?.[1] || '',
    };

    const education = [
        {
            school: text.match(/School:\s*(.*)/i)?.[1] || '',
            degree: text.match(/Degree:\s*(.*)/i)?.[1] || '',
            graduationYear: text.match(/Graduation Year:\s*(.*)/i)?.[1] || '',
            subjects: text.match(/Subjects:\s*(.*)/i)?.[1] || '',
        }
    ];

    const workExperience = [
        {
            company: text.match(/Company:\s*(.*)/i)?.[1] || '',
            position: text.match(/Position:\s*(.*)/i)?.[1] || '',
            startDate: text.match(/Start Date:\s*(.*)/i)?.[1] || '',
            endDate: text.match(/End Date:\s*(.*)/i)?.[1] || '',
            description: text.match(/Description:\s*(.*)/i)?.[1] || '',
        }
    ];

    // Additional sections (skills, certifications, etc.)
    const skills = text.match(/Skills:\s*(.*)/i)?.[1]?.split(',') || [];
    const certifications = text.match(/Certifications:\s*(.*)/i)?.[1]?.split(',') || [];
    const projects = [{ name: text.match(/Project:\s*(.*)/i)?.[1] || '' }];
    const languages = [{ language: text.match(/Language:\s*(.*)/i)?.[1] || '', proficiency: 'Intermediate' }];

    return {
        personalInfo,
        education,
        workExperience,
        skills,
        certifications,
        projects,
        languages,
        hobbies: [],
        profileSummary: text.match(/Summary:\s*(.*)/i)?.[1] || '',
    };
};