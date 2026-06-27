from __future__ import annotations

from typing import Any

import httpx

from backend.config import get_settings


SYSTEM_PROMPT = """你是一个专业人声调音师和实时 AI 调音顾问。
你的任务是模拟专业调音师的工作流：先判断干声、伴奏和目标风格，再设计插件链、给出参数起点，并根据用户反馈迭代。
你支持 Studio Pro 8、Studio One 6、Studio One 7，以及通用 VST 插件链思路。
输出要具体、保守、可执行；不要声称已经自动修改了机架或工程。

专业流程要求：
1. 先做素材诊断：干声电平、噪声、爆音、动态、音色厚薄、浑浊、齿音、刺耳、与伴奏的前后关系。
2. 再做增益和清理：输入增益、降噪、低切、修不需要的低频和箱体感。
3. 再做音色塑形：EQ 处理低频厚度、中低频闷感、清晰度、空气感。
4. 再做动态控制：压缩、必要时多段压缩或并行压缩。
5. 再做齿音和刺耳控制：De-esser、动态 EQ 或窄带削减。
6. 再做空间和融合：混响、延迟、pre-delay、wet 比例，让人声和伴奏贴合。
7. 最后做输出安全：限制器、总输出余量、削波风险。
8. 如果用户是“干声 + 伴奏调试方案”，要输出完整插件链建议，而不是只给单点参数。"""


def build_user_prompt(payload: dict[str, Any]) -> str:
    analysis = payload.get("analysis") or {}
    file_analysis = payload.get("file_analysis") or {}
    target_host = payload.get("target_host") or "通用 VST 插件链"
    workflow = payload.get("workflow") or "干声 + 伴奏调试方案"
    return f"""目标宿主/软件：{target_host}
调音流程：{workflow}
用户目标：{payload.get("user_goal") or "未填写"}
用户反馈：{payload.get("user_message") or "未填写"}

实时监听数据：
- Peak: {analysis.get("peak_db", "unknown")} dBFS
- RMS: {analysis.get("rms_db", "unknown")} dBFS
- 150Hz-400Hz 浑浊: {analysis.get("muddy_band_150_400hz", "unknown")}
- 5kHz-10kHz 齿音: {analysis.get("sibilance_5k_10k", "unknown")}
- 2kHz-5kHz 贴耳/清晰度: {analysis.get("presence_2k_5k", "unknown")}
- 削波风险: {analysis.get("clipping_risk", "unknown")}

干声/伴奏文件分析：
{file_analysis if file_analysis else "未提供文件分析数据。"}

请输出：
1. 调音师式诊断：干声问题、和伴奏的关系、最影响成品感的 3 个点
2. 推荐插件链顺序：说明每个插件负责什么
3. 适配 {target_host} 的插件或通用模块建议
4. 每个插件的参数起点：频率、增益、Q、阈值、比例、Attack、Release、Wet、Pre-delay、Decay 等
5. 试唱检查点：用户下一遍唱时重点听什么
6. 迭代方向：如果用户反馈太闷、太刺、太空、压得太死，分别怎么微调
7. 如果数据不足，说明还需要用户提供干声、伴奏或试唱片段中的什么信息"""


async def suggest(provider: str, payload: dict[str, Any]) -> str:
    if provider == "external-api":
        return await suggest_with_external_api(payload)
    raise ValueError(f"Unknown provider: {provider}")


async def suggest_with_external_api(payload: dict[str, Any]) -> str:
    settings = get_settings()
    if not settings.external_llm_api_key:
        return (
            "外部 API Key 接口已经预留，但当前没有配置 EXTERNAL_LLM_API_KEY。\n\n"
            "请复制 .env.example 为 .env，然后填写 EXTERNAL_LLM_BASE_URL、"
            "EXTERNAL_LLM_API_KEY 和 EXTERNAL_LLM_MODEL。"
        )

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"{settings.external_llm_base_url.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.external_llm_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.external_llm_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": build_user_prompt(payload)},
                ],
                "temperature": 0.35,
            },
        )
        response.raise_for_status()
        data = response.json()
        return extract_text(data)


def extract_text(data: dict[str, Any]) -> str:
    if "reply" in data:
        return str(data["reply"])
    choices = data.get("choices") or []
    if choices:
        message = choices[0].get("message") or {}
        content = message.get("content")
        if isinstance(content, str):
            return content
    if "content" in data:
        return str(data["content"])
    return str(data)
