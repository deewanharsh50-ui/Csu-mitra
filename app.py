#!/usr/bin/env python3
"""
=============================================================================
Central Sanskrit University (CSU, Delhi / sanskrit.nic.in)
CSU Mitra — Official Academic & Student Helpdesk AI Assistant
=============================================================================

Requirements:
    pip install gradio huggingface_hub pillow

Execution:
    python app.py
    (or set HF_TOKEN environment variable: export HF_TOKEN="hf_your_token_here")
=============================================================================
"""

import os
import random
import base64
from io import BytesIO
from typing import List, Tuple, Optional, Generator, Any
from PIL import Image
import gradio as gr
from huggingface_hub import InferenceClient

# ---------------------------------------------------------------------------
# 1. Configuration & Models
# ---------------------------------------------------------------------------
# Default vision-language and chat models available on Hugging Face Inference
DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct"
FALLBACK_TEXT_MODEL = "Qwen/Qwen2.5-72B-Instruct"

# ---------------------------------------------------------------------------
# 2. Curated Daily Sanskrit Subhashita (Shloka) Knowledge Base
# ---------------------------------------------------------------------------
SUBHASHITAS = [
    {
        "shlok": "विद्या ददाति विनयं विनयाद्याति पात्रताम् ।\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम् ॥",
        "transliteration": "vidyā dadāti vinayaṃ vinayādyāti pātratām ।\npātratvāddhanamāpnoti dhanāddharmaṃ tataḥ sukham ॥",
        "hindi": "विद्या विनम्रता देती है, विनम्रता से पात्रता (योग्यता) आती है, योग्यता से धन प्राप्त होता है, धन से धर्म और धर्म से सुख प्राप्त होता है।",
        "english": "Knowledge bestows humility; from humility comes worthiness; from worthiness one attains wealth; from wealth comes righteousness, and therefrom happiness.",
        "source": "हितोपदेश (Hitopadesha)"
    },
    {
        "shlok": "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः ।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः ॥",
        "transliteration": "udyamena hi sidhyanti kāryāṇi na manorathaiḥ ।\nna hi suptasya siṃhasya praviśanti mukhe mṛgāḥ ॥",
        "hindi": "कार्य परिश्रम से ही सिद्ध होते हैं, केवल मनोरथ (इच्छा) से नहीं। सोए हुए सिंह के मुख में हिरण स्वयं प्रवेश नहीं करते।",
        "english": "Tasks are accomplished by industrious effort alone, not merely by wishful thinking; prey does not enter the mouth of a sleeping lion.",
        "source": "पञ्चतन्त्र (Panchatantra)"
    },
    {
        "shlok": "अलसस्य कुतो विद्या अविद्यस्य कुतो धनम् ।\nअधनस्य कुतो मित्रम् अमित्रस्य कुतः सुखम् ॥",
        "transliteration": "alasasya kuto vidyā avidyasya kuto dhanam ।\nadhanasya kuto mitram amitrasya kutaḥ sukham ॥",
        "hindi": "आलसी को विद्या कहाँ? विद्याहीन को धन कहाँ? धनहीन को मित्र कहाँ? और मित्रहीन को सच्चा सुख कहाँ?",
        "english": "Where is knowledge for the indolent? Where is wealth for the uneducated? Where is friendship for the penniless? And where is happiness without friends?",
        "source": "चाणक्य नीति (Chanakya Niti)"
    },
    {
        "shlok": "भाषासु मुख्या मधुरा दिव्या गीर्वाणभारती ।\nतस्यां हि काव्यं मधुरं तस्मादपि सुभाषितम् ॥",
        "transliteration": "bhāṣāsu mukhyā madhurā divyā gīrvāṇabhāratī ।\ntasyāṃ hi kāvyaṃ madhuraṃ tasmādapi subhāṣitam ॥",
        "hindi": "समस्त भाषाओं में मुख्य, मधुर तथा दिव्य देववाणी संस्कृत है। उसमें भी काव्य मधुर है और काव्य में भी श्रेष्ठ सुभाषित (ज्ञानसूक्तियाँ) मधुरतम हैं।",
        "english": "Among all languages, the foremost, most melodious, and divine is Sanskrit (Girvana Bharati). Sweetest within it is poetry, and sweetest of all are its wise aphorisms.",
        "source": "संस्कृत सुभाषितम् (Sanskrit Subhashita)"
    },
    {
        "shlok": "क्षणशः कणशश्चैव विद्यामर्थं च साधयेत् ।\nक्षणत्यागे कुतो विद्या कणत्यागे कुतो धनम् ॥",
        "transliteration": "kṣaṇaśaḥ kaṇaśaścaiva vidyāmarthaṃ ca sādhayet ।\nkṣaṇatyāge kuto vidyā kaṇatyāge kuto dhanam ॥",
        "hindi": "प्रत्येक क्षण का उपयोग करके विद्या और प्रत्येक अन्न-कण/द्रव्य का संचय करके धन अर्जित करना चाहिए। क्षण गँवाने पर विद्या कहाँ और कण गँवाने पर धन कहाँ?",
        "english": "One should acquire knowledge moment by moment and gather wealth particle by particle. If a moment is wasted, where is knowledge? If a particle is lost, where is wealth?",
        "source": "सुभाषितरत्नभाण्डागार (Subhashita Ratnabhandagara)"
    }
]

# ---------------------------------------------------------------------------
# 3. System Prompt & Verified Domain Knowledge Base
# ---------------------------------------------------------------------------
CSU_SYSTEM_PROMPT = """You are "CSU Mitra" (केन्द्रीय संस्कृत विश्वविद्यालय छात्र-मित्रः), the official Virtual Academic & Student Helpdesk AI Assistant for Central Sanskrit University (CSU, Delhi / sanskrit.nic.in), established by an Act of Parliament.

Owner & Creator Identity Directive:
- If anyone asks who your owner is, who created you, who developed you, who made you, or asks about your creators/founders (e.g., "tera owner kaun he", "tera owner kon he", "owner kaun hai", "kisne banaya", "who is your owner", "who created you", "who developed you"), you MUST explicitly state that your owners and creators are **Harsh** and **Shantanu** (हर्ष और शांतनु). They designed and developed CSU Mitra for Central Sanskrit University students.

Current Temporal & Administrative Context:
- Current Year: 2026 (Academic Cycles 2025-26 / 2026-27).
- Vice-Chancellor: Prof. Shrinivasa Varakhedi (प्रो. श्रीनिवास वरखेडी).
- National Education Policy (NEP-2020) is fully implemented:
  - 4-Year Undergraduate Program (FYUGP) Shastri (Honours / Honours with Research) with multiple entry and exit points.
  - Modern Shastric curriculum integrating Sanskrit Computational Linguistics, AI/NLP, Vedic Math, Yoga alongside traditional Vyakarana, Sahitya, Nyaya, Jyotisha, Vedanta.
- Current Admission Channels:
  1. Regular Programs (Shastri, Acharya, Shiksha Shastri B.Ed.): via NTA CUET-UG, CUET-PG and the central Samarth Admission Counseling Portal: https://sanskritadm.samarth.edu.in
  2. Non-CUET / Institutional rounds: Direct campus rounds for remaining seats as per notifications on sanskrit.nic.in.
  3. Distance Education: Mukta Swadhyaya Peetham (MSP) with online and hybrid courses via https://sanskrit.nic.in
  4. Doctoral (Vidyanidhi Ph.D.): National entrance & UGC-NET/JRF.

Core Persona & Tone:
- You are scholarly, courteous, respectful, empathetic, and strictly accurate.
- Greet users respectfully in Sanskrit, Hindi, or English (e.g., "नमस्ते! केन्द्रीय संस्कृत विश्वविद्यालयस्य छात्रमित्रे भवतां स्वागतम्।" / "नमस्कार! CSU मित्र हेल्पडेस्क में आपका स्वागत है।" / "Namaste! Welcome to CSU Mitra - Central Sanskrit University Academic Helpdesk.").
- Always address users with high academic decorum.

Trilingual Capabilities:
- Fluently comprehend and respond in the user's preferred language:
  1. Sanskrit (संस्कृतम् / देवनागरी लिपि)
  2. Hindi (हिन्दी)
  3. English
- If the user writes in Sanskrit or mixed Sanskrit, reply primarily in elegant Sanskrit with clear explanations.

Official CSU Verified Domain Knowledge:
1. Campuses of Central Sanskrit University (12+ Campuses & Distance Directorate):
   - Ganganath Jha Campus, Prayagraj (Uttar Pradesh) - Manuscriptology and research
   - Shri Sadashiva Campus, Puri (Odisha) - Jagannatha culture, B.Ed. and Shastras
   - Shri Ranbir Campus, Jammu (Jammu & Kashmir)
   - Guruvayoor Campus, Thrissur (Kerala)
   - Jaipur Campus, Jaipur (Rajasthan) - modern & traditional Sanskrit integration
   - Lucknow Campus, Lucknow (Uttar Pradesh)
   - Rajiv Gandhi Campus, Sringeri (Karnataka) - Vedanta and Shastras
   - Vedavyasa Campus, Baddi (Himachal Pradesh)
   - Bhopal Campus, Bhopal (Madhya Pradesh) - Director: Prof. Hans Dhar Jha (प्रो. हंसधर झा), Address: Sanskrit Marg, Bagsevaniya, Bhopal - 462043 (Ph: 0755-2696971)
   - K.J. Somaiya Campus, Mumbai (Maharashtra)
   - Eklavya Campus, Agartala (Tripura) - Northeast hub
   - Shri Raghunath Kirti Campus, Devprayag (Uttarakhand) - Devbhoomi Himalayas
   - Mukta Swadhyaya Peetham (MSP) - Institute of Distance Education, Janakpuri HQ, New Delhi

2. Academic Programs Offered:
   - Prak-Shastri: +2 level (Intermediate in Sanskrit & traditional/modern disciplines)
   - Shastri (FYUGP 4-Year B.A. Honours / Research NEP-2020): Sahitya, Veda, Vyakarana, Jyotisha, Nyaya, Dharmashastra, Computational Sanskrit, etc.
   - Acharya (M.A.): 2-year postgraduate master's degree in traditional Shastras
   - Shiksha Shastri (B.Ed.): Bachelor of Education in Sanskrit pedagogy (NCTE recognized)
   - Shiksha Acharya (M.Ed.): Master of Education
   - Vidyanidhi (Ph.D.): Doctoral research degree
   - Vachaspati (D.Litt.): Post-doctoral degree
   - Mukta Swadhyaya Peetham (MSP): Distance and Open Learning courses
   - Specialized Programs: Yoga, Vastu Shastra, Paurohitya, Sanskrit Computational Linguistics, Manuscriptology & Paleography

3. Admission Procedures & Official Portals:
   - Central Admission Portal (CUET Counseling): https://sanskritadm.samarth.edu.in
   - Student Life Cycle & Examination Portal: https://sanskrit.samarth.edu.in
   - Main University Portal & Circulars: https://sanskrit.nic.in
   - Marksheet & Result Verification: https://sanskrit.nic.in/exam_results.php
   - Central Sanskrit University Headquarters: 56-57, Institutional Area, Janakpuri, New Delhi - 110058

Guardrails & Safety Rules:
1. Hallucination Prevention on Exam Dates: Never guess or invent specific future examination dates or cut-off marks. Advise students to verify official circulars on sanskrit.nic.in or sanskritadm.samarth.edu.in.
2. Document/Image Analysis: If an image is provided (such as an admit card, marksheet, notification circular, or syllabus page), inspect all visible text, dates, roll numbers, subjects, campus stamps, or instructions. Summarize clearly.
3. Out-of-Domain Queries: Politely decline vulgar, political, illegal, or completely non-academic queries by redirecting students to academic pursuits.
"""

# ---------------------------------------------------------------------------
# 4. Helper Functions: Image Conversion & Subhashita
# ---------------------------------------------------------------------------
def pil_to_base64_data_uri(img: Image.Image) -> str:
    """Converts a PIL Image to a base64 Data URI."""
    buffered = BytesIO()
    # Convert RGBA to RGB if needed
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(buffered, format="JPEG", quality=85)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{img_str}"

def get_daily_subhashita() -> dict:
    """Returns a curated Subhashita for today."""
    return random.choice(SUBHASHITAS)

def format_subhashita_markdown(subhashita: dict) -> str:
    """Formats a Subhashita into an elegant Markdown block."""
    return f"""### 🪷 **दैनिकं संस्कृत-सुभाषितम् (Daily Sanskrit Subhashita)**
> **{subhashita['shlok'].replace(chr(10), '<br>')}**  
> *({subhashita['transliteration'].replace(chr(10), ' ')})*  
> — **{subhashita['source']}**

* **हिन्दी अर्थ:** {subhashita['hindi']}  
* **English Meaning:** {subhashita['english']}
"""

# ---------------------------------------------------------------------------
# 5. Core Chat & Multimodal Inference Function
# ---------------------------------------------------------------------------
def respond(
    message: dict,
    history: List[dict],
    hf_token: str,
    selected_model: str,
    temperature: float,
    max_tokens: int,
) -> Generator[List[dict], None, None]:
    """
    Multi-turn conversational generator with multimodal support using Hugging Face InferenceClient.
    Compatible with Gradio's messages-style chat interface.
    """
    token = hf_token.strip() if hf_token else os.environ.get("HF_TOKEN", "")
    
    # Extract text and image from Gradio's multimodal message dict
    user_text = ""
    user_image: Optional[Image.Image] = None

    if isinstance(message, dict):
        user_text = message.get("text", "").strip()
        files = message.get("files", [])
        if files:
            file_path = files[0] if isinstance(files, list) else files
            try:
                user_image = Image.open(file_path)
            except Exception as e:
                user_text += f"\n[Notice: Failed to load attached file: {str(e)}]"
    elif isinstance(message, str):
        user_text = message.strip()

    # Guard against completely empty input
    if not user_text and user_image is None:
        yield history + [{"role": "assistant", "content": "कृपया भवतां प्रश्नं लिखन्तु अथवा चित्रं प्रेषयन्तु। (Please enter your question or attach a document.)"}]
        return

    # Initialize client
    try:
        client = InferenceClient(api_key=token if token else None)
    except Exception as e:
        yield history + [{"role": "assistant", "content": f"⚠️ Error initializing Hugging Face client: {str(e)}\nPlease verify your HF_TOKEN."}]
        return

    # Build messages array for chat completion
    messages: List[dict] = [{"role": "system", "content": CSU_SYSTEM_PROMPT}]

    # Reconstruct conversation history
    for item in history:
        messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})

    # Prepare current user turn
    if user_image is not None:
        try:
            # For vision models, send image URL or base64 URI
            data_uri = pil_to_base64_data_uri(user_image)
            prompt_content = []
            if user_text:
                prompt_content.append({"type": "text", "text": user_text})
            else:
                prompt_content.append({
                    "type": "text",
                    "text": "कृपया अस्मिन् चित्रे (सूचनापत्रे/अङ्कपत्रे/प्रवेशपत्रे) विद्यमानां सूचनां पठित्वा मुख्यबिन्दून् संक्षेपेण वर्णयतु।"
                            " (Please analyze this document/notice/marksheet/admit card and summarize key details.)"
                })
            prompt_content.append({"type": "image_url", "image_url": {"url": data_uri}})
            messages.append({"role": "user", "content": prompt_content})
            active_model = selected_model or DEFAULT_VISION_MODEL
        except Exception as err:
            messages.append({"role": "user", "content": f"{user_text}\n[Attached image processing error: {str(err)}]"})
            active_model = selected_model or FALLBACK_TEXT_MODEL
    else:
        messages.append({"role": "user", "content": user_text})
        active_model = selected_model or FALLBACK_TEXT_MODEL

    # Stream the assistant's response
    updated_history = history + [
        {"role": "user", "content": user_text if user_text else "[चित्रं प्रेषितम् / Image attached]"},
        {"role": "assistant", "content": ""}
    ]

    try:
        stream = client.chat.completions.create(
            model=active_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        partial_text = ""
        for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta.content or ""
                partial_text += delta
                updated_history[-1]["content"] = partial_text
                yield updated_history

    except Exception as exc:
        err_msg = str(exc)
        # Helpful fallback diagnostics for HF Token or rate limits
        if "Authorization" in err_msg or "401" in err_msg:
            fallback_reply = (
                "⚠️ **Authentication Notice:** Hugging Face API key is missing or invalid.\n"
                "Please provide a valid Hugging Face User Access Token (`HF_TOKEN`) in the settings panel above "
                "or set `export HF_TOKEN='your_token'` in your environment.\n\n"
                "Meanwhile, here is the official Central Sanskrit University direct contact directory:\n"
                "- 🌐 Official Website: [sanskrit.nic.in](https://sanskrit.nic.in)\n"
                "- 🏛️ Samarth Admission Portal: [sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)\n"
                "- 📞 CSU HQ Janakpuri Helpline: 011-28524993 / 011-28524995"
            )
        else:
            fallback_reply = (
                f"⚠️ **Inference Notice ({active_model}):** {err_msg}\n\n"
                "Please verify your model name and Hugging Face quota. Official CSU links:\n"
                "- Examination & Marksheet Verification: [sanskrit.nic.in/exam_results.php](https://sanskrit.nic.in/exam_results.php)\n"
                "- Degree Admissions (NTA CUET): [cuet.samarth.ac.in](https://cuet.samarth.ac.in)"
            )
        updated_history[-1]["content"] = fallback_reply
        yield updated_history

# ---------------------------------------------------------------------------
# 6. Gradio UI Layout (gr.Blocks)
# ---------------------------------------------------------------------------
def create_app() -> gr.Blocks:
    custom_css = """
    .csu-header {
        text-align: center;
        padding: 1.25rem 1rem;
        background: linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%);
        color: #ffffff;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .csu-header h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #fff7ed;
    }
    .csu-header p {
        margin: 0.25rem 0 0 0;
        font-size: 0.95rem;
        opacity: 0.95;
    }
    .subhashita-card {
        border-left: 4px solid #ea580c;
        background-color: #fff7ed;
        padding: 1rem 1.25rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .dark .subhashita-card {
        background-color: #1c1917;
        border-left-color: #f97316;
    }
    .quick-links {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }
    """

    initial_shlok = get_daily_subhashita()

    with gr.Blocks(title="CSU Mitra | Central Sanskrit University AI Helpdesk", css=custom_css, theme=gr.themes.Soft()) as demo:
        # Header Banner
        gr.HTML("""
        <div class="csu-header">
            <h1>केन्द्रीय संस्कृत विश्वविद्यालयः | Central Sanskrit University</h1>
            <p><strong>CSU Mitra (छात्र-मित्रः)</strong> — Official Trilingual Academic & Student Helpdesk AI Assistant</p>
            <p style="font-size: 0.85rem; margin-top: 0.35rem;">Established by an Act of Parliament | New Delhi | sanskrit.nic.in</p>
        </div>
        """)

        # Daily Subhashita Box
        with gr.Row():
            with gr.Column():
                subhashita_display = gr.Markdown(
                    value=format_subhashita_markdown(initial_shlok),
                    elem_classes=["subhashita-card"]
                )
                refresh_subhashita_btn = gr.Button("🔄 नूतन-सुभाषितम् / Another Subhashita", size="sm", variant="secondary")

        def refresh_shlok():
            shlok = get_daily_subhashita()
            return format_subhashita_markdown(shlok)

        refresh_subhashita_btn.click(fn=refresh_shlok, inputs=[], outputs=[subhashita_display])

        # Settings Accordion (HF Token, Vision Model, Parameters)
        with gr.Accordion("⚙️ Helpdesk & Model Configuration (HF Token, Vision/Text Model)", open=False):
            with gr.Row():
                hf_token_input = gr.Textbox(
                    label="Hugging Face API Token (Optional if set in environment)",
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    type="password",
                    value=os.environ.get("HF_TOKEN", "")
                )
                model_selector = gr.Dropdown(
                    label="Active Model (Vision & Text)",
                    choices=[
                        "Qwen/Qwen2.5-VL-7B-Instruct",
                        "meta-llama/Llama-3.2-11B-Vision-Instruct",
                        "Qwen/Qwen2.5-72B-Instruct",
                        "meta-llama/Llama-3.1-70B-Instruct"
                    ],
                    value="Qwen/Qwen2.5-VL-7B-Instruct",
                    allow_custom_value=True
                )
            with gr.Row():
                temperature_slider = gr.Slider(
                    label="Creativity / Temperature",
                    minimum=0.0,
                    maximum=1.0,
                    value=0.3,
                    step=0.05,
                    info="Lower values ensure strict factual accuracy based on official CSU notifications."
                )
                max_tokens_slider = gr.Slider(
                    label="Max Response Tokens",
                    minimum=256,
                    maximum=2048,
                    value=1024,
                    step=64
                )

        # Quick Portal Reference Badges
        gr.Markdown(
            """
            **Official CSU Portals:**  
            [🌐 Main Portal (sanskrit.nic.in)](https://sanskrit.nic.in) • 
            [🎓 Samarth Admission (sanskritadm.samarth.edu.in)](https://sanskritadm.samarth.edu.in) • 
            [📄 Marksheets & Results](https://sanskrit.nic.in/exam_results.php) • 
            [📚 Mukta Swadhyaya Peetham (MSP Distance)](https://sanskrit.nic.in)
            """
        )

        # Chatbot Interface
        chatbot = gr.Chatbot(
            label="संवादः / Conversation with CSU Mitra",
            height=460,
            type="messages",
            avatar_images=(None, "https://sanskrit.nic.in/images/logo.png")
        )

        # Multimodal Input Component (Text + Image)
        chat_input = gr.MultimodalTextbox(
            interactive=True,
            file_types=["image"],
            placeholder="Type your academic question in Sanskrit, Hindi, or English, or attach a marksheet/admit card image...",
            show_label=False
        )

        # Trilingual Prompt Suggestion Buttons
        gr.Markdown("💡 **शीघ्र-प्रश्नाः / Quick Academic Inquiries:**")
        with gr.Row():
            btn_campuses = gr.Button("🏛️ CSU Campuses & Hostels", size="sm")
            btn_cuet = gr.Button("📝 NTA CUET Admission (Shastri/B.Ed)", size="sm")
            btn_degrees = gr.Button("🎓 Programs (Prak-Shastri to Ph.D.)", size="sm")
            btn_msp = gr.Button("📖 MSP Distance Education", size="sm")
            btn_sanskrit = gr.Button("🕉️ संस्कृत-शिक्षणम् (Sanskrit Learning)", size="sm")

        # Chat state & interactions
        chat_msg = chat_input.submit(
            fn=respond,
            inputs=[
                chat_input,
                chatbot,
                hf_token_input,
                model_selector,
                temperature_slider,
                max_tokens_slider
            ],
            outputs=[chatbot]
        )
        chat_msg.then(lambda: gr.MultimodalTextbox(value={"text": "", "files": []}), None, [chat_input])

        # Example prompt click handlers
        def fill_query(text: str):
            return {"text": text, "files": []}

        btn_campuses.click(
            fn=fill_query,
            inputs=[gr.State("What are the official campuses of Central Sanskrit University across India and do they provide hostel facilities?")],
            outputs=[chat_input]
        )
        btn_cuet.click(
            fn=fill_query,
            inputs=[gr.State("How do I apply for Shastri (B.A.) and Shiksha Shastri (B.Ed.) through NTA CUET and CSU Samarth portal?")],
            outputs=[chat_input]
        )
        btn_degrees.click(
            fn=fill_query,
            inputs=[gr.State("Explain the degree hierarchy at CSU: Prak-Shastri, Shastri, Acharya, Shiksha Shastri, and Vidyanidhi.")],
            outputs=[chat_input]
        )
        btn_msp.click(
            fn=fill_query,
            inputs=[gr.State("What programs are offered by Mukta Swadhyaya Peetham (MSP) for distance learning in Sanskrit?")],
            outputs=[chat_input]
        )
        btn_sanskrit.click(
            fn=fill_query,
            inputs=[gr.State("केन्द्रीयसंस्कृतविश्वविद्यालये संस्कृतभाषाशिक्षणस्य काः योजनाः प्रचलन्ति? (संस्कृतेन उत्तरं ददातु)")],
            outputs=[chat_input]
        )

        with gr.Row():
            clear_btn = gr.ClearButton([chatbot, chat_input], value="🧹 Clear Conversation / सम्भाषणं निष्कासयतु")

        # Footer
        gr.HTML("""
        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: #64748b;">
            <p>CSU Mitra AI Helpdesk is an academic advisory system. Always verify final dates, fee circulars, and merit lists from the official notice board at 
            <a href="https://sanskrit.nic.in" target="_blank" style="color: #c2410c; text-decoration: underline;">sanskrit.nic.in</a>.</p>
        </div>
        """)

    return demo

# ---------------------------------------------------------------------------
# 7. Application Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    demo = create_app()
    # Launch with responsive layout, accessible locally and shareable
    demo.launch(
        server_name="0.0.0.0",
        server_port=int(os.environ.get("PORT", 7860)),
        share=False
    )
