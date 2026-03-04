export interface Option {
    key: string;
    value: string;
}

export interface Question {
    id: string | number;
    question: string;
    options: Option[];
    answer: string;
}

interface ScorePayload {
    id: string;
    score: number;
    timestamp: string;
}

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

const mockQuizPool: Question[] = [
    {
        id: 1,
        question: '在 Transformer 架构中，自注意力机制 (Self-Attention) 的核心作用是什么？',
        options: [
            { key: 'A', value: '作为非线性激活函数降维' },
            { key: 'B', value: '捕捉序列中任意两词的长距离依赖关系' },
            { key: 'C', value: '防止预训练过程中的过拟合' },
            { key: 'D', value: '进行词性标注与情感分析' }
        ],
        answer: 'B'
    },
    {
        id: 2,
        question: '大语言模型在推理时常用的 KV Cache 技术，其根本目的是什么？',
        options: [
            { key: 'A', value: '缓存历史 Prompt 避免重新输入' },
            { key: 'B', value: '存储模型权重以减少显存占用' },
            { key: 'C', value: '保存之前生成的注意力键值对，加速自回归生成计算' },
            { key: 'D', value: '用来持久化存储外部知识库的内容' }
        ],
        answer: 'C'
    },
    {
        id: 3,
        question: '在 RLHF（基于人类反馈的强化学习）阶段，Reward Model 的主要作用是？',
        options: [
            { key: 'A', value: '惩罚模型生成不连贯的语法错误' },
            { key: 'B', value: '模拟人类偏好，为生成的回复打分奖励' },
            { key: 'C', value: '自动搜索互联网获取最新信息强化模型' },
            { key: 'D', value: '用于对原始文本进行无监督聚类' }
        ],
        answer: 'B'
    },
    {
        id: 4,
        question: '调整大语言模型的 Temperature 参数为 0.1（相比于 1.0），会带来什么效果？',
        options: [
            { key: 'A', value: '生成的内容更加多样化和具有创造性' },
            { key: 'B', value: '模型的推理速度大幅提升' },
            { key: 'C', value: '回答变得更加确定、刻板，倾向于高概率分布输出' },
            { key: 'D', value: '模型开始支持更长的上下文输入窗口' }
        ],
        answer: 'C'
    },
    {
        id: 5,
        question: 'LoRA (Low-Rank Adaptation) 是一种常用的微调技术，它的核心优势是？',
        options: [
            { key: 'A', value: '冻结预训练权重，只需训练旁路注入的低秩矩阵参数' },
            { key: 'B', value: '通过降低模型的量化精度来加速推理' },
            { key: 'C', value: '能够让几十亿参数的小模型获得超过 GPT-4 的涌现能力' },
            { key: 'D', value: '完全不需要高质量的标注数据即可完成微调' }
        ],
        answer: 'A'
    },
    {
        id: 6,
        question: '大语言模型产生“幻觉”(Hallucination) 的本质原因通常不包括以下哪项？',
        options: [
            { key: 'A', value: '训练数据中本身包含冲突或错误的信息' },
            { key: 'B', value: '模型在强行补全概率较低的知识盲区' },
            { key: 'C', value: '模型具备了真正的自我意识并试图欺骗人类' },
            { key: 'D', value: '对超长上下文的注意力分配出现偏差或遗忘' }
        ],
        answer: 'C'
    },
    {
        id: 7,
        question: '关于大模型常用的 BPE (Byte Pair Encoding) 分词算法，以下描述正确的是？',
        options: [
            { key: 'A', value: '它完全基于人类硬编码的语义词典进行切词' },
            { key: 'B', value: '通过统计高频相邻字符簇，进行自底向上的动态合并构建词表' },
            { key: 'C', value: '遇到完全未见过的生僻词时会直接报错或丢弃' },
            { key: 'D', value: '仅适用于纯英文字母构成的文本处理' }
        ],
        answer: 'B'
    },
    {
        id: 8,
        question: '在 Transformer 的输入序列中引入位置编码 (Positional Encoding) 是因为？',
        options: [
            { key: 'A', value: '自注意力操作本身对序列顺序是置换不变的 (Permutation Invariant)' },
            { key: 'B', value: '为了将单一文本映射为更高维度的稠密向量空间' },
            { key: 'C', value: '能极大地加速模型的反向传播收敛过程' },
            { key: 'D', value: '帮助模型记忆预训练语料的来源出处' }
        ],
        answer: 'A'
    },
    {
        id: 9,
        question: 'Scaling Laws（缩放定律）指出，大模型（如 Transformer）的交叉熵损失通常与以下哪些核心因素呈明显幂律关系？',
        options: [
            { key: 'A', value: '仅与模型非嵌入层参数量相关' },
            { key: 'B', value: '仅与高质量训练数据 Token 量相关' },
            { key: 'C', value: '计算总量 (Compute) 、模型参数量和训练数据规模' },
            { key: 'D', value: '模型的绝对层数深度和多头注意力头数' }
        ],
        answer: 'C'
    },
    {
        id: 10,
        question: 'Prompt Engineering 中的 Few-Shot Learning (少样本提示) 利用了大模型的什么核心特性？',
        options: [
            { key: 'A', value: '强大的上下文学习 (In-Context Learning) 能力' },
            { key: 'B', value: '根据提示词在线实时微调神经元权重' },
            { key: 'C', value: '内置且外挂了实时的知识图谱推理引擎' },
            { key: 'D', value: '强化学习中的惩罚奖励反馈机制' }
        ],
        answer: 'A'
    }
];

// Mock data generator for fallback
const getMockQuestions = (count: number): Question[] => {
    // eslint-disable-next-line sonarjs/pseudo-random
    const shuffled = [...mockQuizPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const fetchQuestions = async (count: number): Promise<Question[]> => {
    // Use mock data if no GAS URL is provided
    if (!GAS_URL || GAS_URL === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
        console.log('Using mock questions (No valid GAS URL configured)');
        return new Promise(resolve => setTimeout(() => resolve(getMockQuestions(count)), 1000));
    }

    try {
        const response = await fetch(`${GAS_URL}?count=${count}`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        // Fallback to mock on error
        return getMockQuestions(count);
    }
};

export const submitScore = async (payload: ScorePayload): Promise<boolean> => {
    if (!GAS_URL || GAS_URL === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
        console.log('Mock score submitted:', payload);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });

        // GAS always returns a redirect for POST, fetch follows it automatically
        // The final response might be HTML or JSON depending on GAS config
        const result = await response.json().catch(() => ({ success: true }));
        return result.success !== false;
    } catch (error) {
        console.error('Failed to submit score:', error);
        return false;
    }
};
