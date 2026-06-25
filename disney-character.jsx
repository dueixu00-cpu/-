import { useState, useRef } from "react";

export default function DisneyApp() {
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState("");
  const [count, setCount] = useState("커플 2명");
  const [mood, setMood] = useState("장난스럽고 유쾌한");
  const [bg, setBg] = useState("반짝이는 별빛 밤하늘");
  const [style, setStyle] = useState("픽사 3D 애니메이션");
  const inputRef = useRef(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  async function generatePrompt() {
    if (!imageBase64) {
      showToast("📸 먼저 사진을 올려주세요!");
      return;
    }
    setLoading(true);
    setResult(null);

    const systemPrompt = `당신은 사진을 분석해서 디즈니/픽사 스타일 AI 이미지 생성 프롬프트를 만드는 전문가입니다.
사용자의 사진을 보고 인원 수, 성별, 머리색/길이, 얼굴형, 특징적인 외모를 분석하세요.
아래 JSON 형식으로만 응답하세요 (마크다운 없이 순수 JSON):
{"en":"영어 이미지 생성 프롬프트","ko":"한국어로 된 캐릭터 설명"}`;

    const userMsg = `사진을 분석해서 아래 설정으로 디즈니 캐릭터 프롬프트를 만들어주세요:
- 스타일: ${style}
- 인원: ${count}
- 분위기: ${mood}
- 배경: ${bg}
영어 프롬프트는 사진 속 인물의 외모 특징을 최대한 반영해서 상세하게 만들어주세요.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
              { type: "text", text: userMsg }
            ]
          }]
        })
      });
      const data = await response.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      showToast("오류가 발생했어요. 다시 시도해주세요 😢");
    } finally {
      setLoading(false);
    }
  }

  function copyPrompt() {
    if (!result) return;
    navigator.clipboard.writeText(result.en).then(() => showToast("✅ 복사 완료! ChatGPT에 붙여넣으세요"));
  }

  const selectStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid rgba(176,141,222,0.4)",
    fontSize: "13px",
    fontFamily: "inherit",
    background: "white",
    color: "#2a1a3e",
    cursor: "pointer",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #e8f4ff 0%, #f9e8ff 50%, #fff0f5 100%)",
      fontFamily: "'Nanum Gothic', sans-serif",
      color: "#2a1a3e",
      padding: "0 0 60px",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8, display: "inline-block", animation: "float 3s ease-in-out infinite" }}>🪄</div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            background: "linear-gradient(135deg, #b08dde, #f4829a, #f7c948)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}>나를 디즈니 캐릭터로</h1>
          <p style={{ fontSize: 13, color: "#7a6a8a", lineHeight: 1.7 }}>
            사진을 올리면 나만의 디즈니 캐릭터 프롬프트를 만들어드려요<br />
            ChatGPT / Gemini에 붙여넣으면 바로 완성! ✨
          </p>
        </div>

        {/* Upload Card */}
        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(176,141,222,0.15)", marginBottom: 16, border: "1.5px solid rgba(176,141,222,0.2)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#b08dde", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>📸 사진 업로드</div>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: "2.5px dashed rgba(176,141,222,0.45)",
              borderRadius: 18,
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "linear-gradient(135deg, rgba(176,141,222,0.05), rgba(244,130,154,0.04))",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>🖼️</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>여기를 눌러 사진을 올려주세요</div>
            <div style={{ fontSize: 12, color: "#9a8aaa" }}>셀카, 커플사진, 단체사진 모두 OK</div>
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Preview */}
          {imagePreview && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <img src={imagePreview} alt="preview" style={{ width: 110, height: 110, objectFit: "cover", borderRadius: "50%", border: "3px solid #b08dde", boxShadow: "0 4px 16px rgba(176,141,222,0.3)" }} />
              <div style={{ fontSize: 12, color: "#b08dde", fontWeight: 700, marginTop: 8 }}>✅ 사진 준비 완료!</div>
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(176,141,222,0.15)", marginBottom: 16, border: "1.5px solid rgba(176,141,222,0.2)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#b08dde", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>🎨 스타일 설정</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "인원", value: count, setter: setCount, options: ["혼자 (1명)", "커플 2명", "3명 그룹"] },
              { label: "분위기", value: mood, setter: setMood, options: ["귀엽고 발랄한", "로맨틱한", "장난스럽고 유쾌한", "우아하고 고급스러운"] },
              { label: "배경", value: bg, setter: setBg, options: ["마법의 성 앞", "꽃이 가득한 들판", "반짝이는 별빛 밤하늘", "바닷가 석양", "마법의 숲속"] },
              { label: "스타일", value: style, setter: setStyle, options: ["픽사 3D 애니메이션", "디즈니 클래식 2D", "디즈니 프린세스", "치비 캐릭터"] },
            ].map(({ label, value, setter, options }) => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7a6a8a", marginBottom: 6 }}>{label}</div>
                <select value={value} onChange={(e) => setter(e.target.value)} style={selectStyle}>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePrompt}
          disabled={loading}
          style={{
            width: "100%",
            padding: "18px",
            background: loading ? "#ccc" : "linear-gradient(135deg, #b08dde, #f4829a)",
            color: "white",
            border: "none",
            borderRadius: 18,
            fontSize: 16,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 20px rgba(176,141,222,0.35)",
            marginBottom: 20,
            fontFamily: "inherit",
          }}
        >
          {loading ? "✨ 마법을 걸고 있어요..." : "✨ 디즈니 캐릭터 프롬프트 만들기"}
        </button>

        {/* Result */}
        {result && (
          <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(176,141,222,0.15)", marginBottom: 16, border: "1.5px solid rgba(247,201,72,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>🎉 프롬프트 완성!</span>
              <span style={{ background: "linear-gradient(135deg, #f7c948, #f4829a)", color: "white", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>READY TO USE</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#7a6a8a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🇺🇸 영어 프롬프트 (ChatGPT / Gemini용)</div>
              <div style={{ background: "#f8f4ff", border: "1.5px solid rgba(176,141,222,0.25)", borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.7, color: "#3a2a5a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {result.en}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#7a6a8a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🇰🇷 한국어 설명</div>
              <div style={{ background: "#f8f4ff", border: "1.5px solid rgba(176,141,222,0.25)", borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.7, color: "#3a2a5a" }}>
                {result.ko}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={copyPrompt} style={{ padding: 13, background: "linear-gradient(135deg, #b08dde, #8b6ab8)", color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                📋 영어 프롬프트 복사
              </button>
              <a href="https://chat.openai.com" target="_blank" rel="noreferrer" style={{ padding: 13, background: "linear-gradient(135deg, #19a37a, #0d7a5a)", color: "white", borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                🤖 ChatGPT 열기
              </a>
            </div>
          </div>
        )}

        {/* How to */}
        <div style={{ background: "linear-gradient(135deg, rgba(176,141,222,0.08), rgba(244,130,154,0.06))", borderRadius: 20, padding: 24, border: "1.5px solid rgba(176,141,222,0.15)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#b08dde", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>✨ 이렇게 사용하세요</div>
          {[
            ["1", "사진을 올리고 프롬프트 만들기 버튼을 누르세요"],
            ["2", "영어 프롬프트 복사를 눌러 클립보드에 저장하세요"],
            ["3", "ChatGPT / Gemini를 열고 프롬프트를 붙여넣으세요 (Ctrl+V)"],
            ["4", "생성된 캐릭터를 인스타에 공유하고 친구들에게 알려주세요! 💕"],
          ].map(([n, t]) => (
            <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #b08dde, #f4829a)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{n}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "#4a3a6a", paddingTop: 3 }}>{t}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "#9a8aaa" }}>
          마음에 드셨다면 팔로우해주세요 💜
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
          background: "#2a1a3e", color: "white", padding: "12px 24px",
          borderRadius: 30, fontSize: 14, fontWeight: 700, zIndex: 100, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
