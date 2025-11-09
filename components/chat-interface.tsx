"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { QuizModal } from "./quiz-modal"

interface Message {
  role: "user" | "assistant"
  content: string
  englishTranslation?: string  // For non-English messages
}

type LangCode = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'it' | 'ar' | 'zh' | 'ja' | 'pt' | 'ru' | 'ko' | 'nl' | 'pl' | 'tr' | 'sv' | 'da' | 'fi' | 'no'

// Translation object for UI text
const translations: Record<LangCode, {
  greeting: (figure: string) => string
  askPlaceholder: (figure: string) => string
  stopMic: string
  speak: string
  send: string
  clear: string
  stop: string
  savePdf: string
  preparing: string
  thinking: (figure: string) => string
  readAloud: string
  clearTitle: string
  stopAudio: string
  savePdfTitle: string
  quizTitle: string
  micTitle: string
  micTitleNotSupported: string
  stopMicTitle: string
}> = {
  en: {
    greeting: (f) => `Greetings! I am ${f}. I am pleased to share knowledge about my era and expertise. What would you like to know?`,
    askPlaceholder: (f) => `Ask ${f} about their era...`,
    stopMic: 'Stop Mic',
    speak: 'Speak',
    send: 'Send',
    clear: 'Clear',
    stop: 'Stop',
    savePdf: 'Save Summary PDF',
    preparing: 'Preparing…',
    thinking: (f) => `${f} is thinking...`,
    readAloud: '🔊 Read aloud',
    clearTitle: 'Clear current chat',
    stopAudio: 'Stop audio',
    savePdfTitle: 'Save important points and timeline as PDF',
    quizTitle: 'Take a quiz about what you learned',
    micTitle: 'Speak your question',
    micTitleNotSupported: 'Speech input not supported in this browser',
    stopMicTitle: 'Stop listening'
  },
  es: {
    greeting: (f) => `¡Saludos! Soy ${f}. Me complace compartir conocimientos sobre mi época y experiencia. ¿Qué te gustaría saber?`,
    askPlaceholder: (f) => `Pregunta a ${f} sobre su época...`,
    stopMic: 'Parar Micrófono',
    speak: 'Hablar',
    send: 'Enviar',
    clear: 'Limpiar',
    stop: 'Parar',
    savePdf: 'Guardar Resumen PDF',
    preparing: 'Preparando…',
    thinking: (f) => `${f} está pensando...`,
    readAloud: '🔊 Leer en voz alta',
    clearTitle: 'Limpiar chat actual',
    stopAudio: 'Detener audio',
    savePdfTitle: 'Guardar puntos importantes y línea de tiempo como PDF',
    quizTitle: 'Toma un cuestionario sobre lo que aprendiste',
    micTitle: 'Di tu pregunta',
    micTitleNotSupported: 'Entrada de voz no compatible con este navegador',
    stopMicTitle: 'Dejar de escuchar'
  },
  fr: {
    greeting: (f) => `Salutations ! Je suis ${f}. Je suis heureux de partager mes connaissances sur mon époque et mon expertise. Que voudriez-vous savoir ?`,
    askPlaceholder: (f) => `Demandez à ${f} à propos de son époque...`,
    stopMic: 'Arrêter Micro',
    speak: 'Parler',
    send: 'Envoyer',
    clear: 'Effacer',
    stop: 'Arrêter',
    savePdf: 'Enregistrer Résumé PDF',
    preparing: 'Préparation…',
    thinking: (f) => `${f} réfléchit...`,
    readAloud: '🔊 Lire à voix haute',
    clearTitle: 'Effacer la discussion actuelle',
    stopAudio: 'Arrêter l\'audio',
    savePdfTitle: 'Enregistrer les points importants et la chronologie en PDF',
    quizTitle: 'Passez un quiz sur ce que vous avez appris',
    micTitle: 'Dites votre question',
    micTitleNotSupported: 'Entrée vocale non prise en charge par ce navigateur',
    stopMicTitle: 'Arrêter d\'écouter'
  },
  de: {
    greeting: (f) => `Grüße! Ich bin ${f}. Ich freue mich, Wissen über meine Ära und Expertise zu teilen. Was möchten Sie wissen?`,
    askPlaceholder: (f) => `Fragen Sie ${f} über ihre Ära...`,
    stopMic: 'Mikrofon stoppen',
    speak: 'Sprechen',
    send: 'Senden',
    clear: 'Löschen',
    stop: 'Stopp',
    savePdf: 'Zusammenfassung als PDF speichern',
    preparing: 'Vorbereitung…',
    thinking: (f) => `${f} denkt nach...`,
    readAloud: '🔊 Vorlesen',
    clearTitle: 'Aktuellen Chat löschen',
    stopAudio: 'Audio stoppen',
    savePdfTitle: 'Wichtige Punkte und Zeitleiste als PDF speichern',
    quizTitle: 'Machen Sie ein Quiz über das, was Sie gelernt haben',
    micTitle: 'Sprechen Sie Ihre Frage',
    micTitleNotSupported: 'Spracheingabe wird von diesem Browser nicht unterstützt',
    stopMicTitle: 'Aufhören zuzuhören'
  },
  it: {
    greeting: (f) => `Saluti! Sono ${f}. Sono lieto di condividere la conoscenza sulla mia era e competenza. Cosa vorresti sapere?`,
    askPlaceholder: (f) => `Chiedi a ${f} sulla loro era...`,
    stopMic: 'Ferma Microfono',
    speak: 'Parla',
    send: 'Invia',
    clear: 'Cancella',
    stop: 'Ferma',
    savePdf: 'Salva Riepilogo PDF',
    preparing: 'Preparazione…',
    thinking: (f) => `${f} sta pensando...`,
    readAloud: '🔊 Leggi ad alta voce',
    clearTitle: 'Cancella chat corrente',
    stopAudio: 'Ferma audio',
    savePdfTitle: 'Salva punti importanti e cronologia come PDF',
    quizTitle: 'Fai un quiz su ciò che hai imparato',
    micTitle: 'Pronuncia la tua domanda',
    micTitleNotSupported: 'Input vocale non supportato da questo browser',
    stopMicTitle: 'Smetti di ascoltare'
  },
  pt: {
    greeting: (f) => `Saudações! Eu sou ${f}. Tenho o prazer de compartilhar conhecimento sobre minha era e expertise. O que você gostaria de saber?`,
    askPlaceholder: (f) => `Pergunte a ${f} sobre sua era...`,
    stopMic: 'Parar Microfone',
    speak: 'Falar',
    send: 'Enviar',
    clear: 'Limpar',
    stop: 'Parar',
    savePdf: 'Salvar Resumo PDF',
    preparing: 'Preparando…',
    thinking: (f) => `${f} está pensando...`,
    readAloud: '🔊 Ler em voz alta',
    clearTitle: 'Limpar chat atual',
    stopAudio: 'Parar áudio',
    savePdfTitle: 'Salvar pontos importantes e cronologia como PDF',
    quizTitle: 'Faça um quiz sobre o que você aprendeu',
    micTitle: 'Fale sua pergunta',
    micTitleNotSupported: 'Entrada de voz não suportada neste navegador',
    stopMicTitle: 'Parar de ouvir'
  },
  ru: {
    greeting: (f) => `Приветствую! Я ${f}. Я рад поделиться знаниями о моей эпохе и опыте. Что бы вы хотели узнать?`,
    askPlaceholder: (f) => `Спросите ${f} об их эпохе...`,
    stopMic: 'Остановить микрофон',
    speak: 'Говорить',
    send: 'Отправить',
    clear: 'Очистить',
    stop: 'Стоп',
    savePdf: 'Сохранить резюме PDF',
    preparing: 'Подготовка…',
    thinking: (f) => `${f} думает...`,
    readAloud: '🔊 Прочитать вслух',
    clearTitle: 'Очистить текущий чат',
    stopAudio: 'Остановить аудио',
    savePdfTitle: 'Сохранить важные пункты и хронологию в PDF',
    quizTitle: 'Пройдите тест о том, что вы узнали',
    micTitle: 'Произнесите свой вопрос',
    micTitleNotSupported: 'Голосовой ввод не поддерживается этим браузером',
    stopMicTitle: 'Перестать слушать'
  },
  zh: {
    greeting: (f) => `问候！我是${f}。我很高兴分享关于我的时代和专业知识。你想知道什么？`,
    askPlaceholder: (f) => `询问${f}关于他们的时代...`,
    stopMic: '停止麦克风',
    speak: '说话',
    send: '发送',
    clear: '清除',
    stop: '停止',
    savePdf: '保存摘要PDF',
    preparing: '准备中…',
    thinking: (f) => `${f}正在思考...`,
    readAloud: '🔊 朗读',
    clearTitle: '清除当前聊天',
    stopAudio: '停止音频',
    savePdfTitle: '将重要要点和时间线保存为PDF',
    quizTitle: '进行关于你所学内容的测验',
    micTitle: '说出你的问题',
    micTitleNotSupported: '此浏览器不支持语音输入',
    stopMicTitle: '停止听'
  },
  ja: {
    greeting: (f) => `こんにちは！私は${f}です。私の時代と専門知識について知識を共有できることを嬉しく思います。何を知りたいですか？`,
    askPlaceholder: (f) => `${f}に彼らの時代について尋ねる...`,
    stopMic: 'マイクを停止',
    speak: '話す',
    send: '送信',
    clear: 'クリア',
    stop: '停止',
    savePdf: '概要PDFを保存',
    preparing: '準備中…',
    thinking: (f) => `${f}は考えています...`,
    readAloud: '🔊 音読',
    clearTitle: '現在のチャットをクリア',
    stopAudio: 'オーディオを停止',
    savePdfTitle: '重要なポイントとタイムラインをPDFとして保存',
    quizTitle: '学んだ内容についてクイズを受ける',
    micTitle: '質問を話してください',
    micTitleNotSupported: 'このブラウザは音声入力をサポートしていません',
    stopMicTitle: '聞くのをやめる'
  },
  ko: {
    greeting: (f) => `안녕하세요! 저는 ${f}입니다. 제 시대와 전문 지식에 대한 지식을 공유하게 되어 기쁩니다. 무엇을 알고 싶으신가요?`,
    askPlaceholder: (f) => `${f}에게 그들의 시대에 대해 물어보세요...`,
    stopMic: '마이크 중지',
    speak: '말하기',
    send: '보내기',
    clear: '지우기',
    stop: '중지',
    savePdf: '요약 PDF 저장',
    preparing: '준비 중…',
    thinking: (f) => `${f}이(가) 생각하고 있습니다...`,
    readAloud: '🔊 소리내어 읽기',
    clearTitle: '현재 채팅 지우기',
    stopAudio: '오디오 중지',
    savePdfTitle: '중요한 포인트와 타임라인을 PDF로 저장',
    quizTitle: '배운 내용에 대한 퀴즈 풀기',
    micTitle: '질문을 말하세요',
    micTitleNotSupported: '이 브라우저는 음성 입력을 지원하지 않습니다',
    stopMicTitle: '듣기 중지'
  },
  ar: {
    greeting: (f) => `تحياتي! أنا ${f}. يسعدني مشاركة المعرفة حول عصري وخبرتي. ماذا تريد أن تعرف؟`,
    askPlaceholder: (f) => `اسأل ${f} عن عصرهم...`,
    stopMic: 'إيقاف الميكروفون',
    speak: 'تحدث',
    send: 'إرسال',
    clear: 'مسح',
    stop: 'إيقاف',
    savePdf: 'حفظ ملخص PDF',
    preparing: 'جاري التحضير…',
    thinking: (f) => `${f} يفكر...`,
    readAloud: '🔊 قراءة بصوت عالٍ',
    clearTitle: 'مسح المحادثة الحالية',
    stopAudio: 'إيقاف الصوت',
    savePdfTitle: 'حفظ النقاط المهمة والجدول الزمني بصيغة PDF',
    quizTitle: 'خذ اختبارًا حول ما تعلمته',
    micTitle: 'قل سؤالك',
    micTitleNotSupported: 'إدخال الصوت غير مدعوم في هذا المتصفح',
    stopMicTitle: 'توقف عن الاستماع'
  },
  hi: {
    greeting: (f) => `नमस्ते! मैं ${f} हूं। मुझे अपने युग और विशेषज्ञता के बारे में ज्ञान साझा करने में खुशी है। आप क्या जानना चाहेंगे?`,
    askPlaceholder: (f) => `${f} से उनके युग के बारे में पूछें...`,
    stopMic: 'माइक बंद करें',
    speak: 'बोलें',
    send: 'भेजें',
    clear: 'साफ़ करें',
    stop: 'रोकें',
    savePdf: 'सारांश PDF सहेजें',
    preparing: 'तैयारी हो रही है…',
    thinking: (f) => `${f} सोच रहे हैं...`,
    readAloud: '🔊 जोर से पढ़ें',
    clearTitle: 'वर्तमान चैट साफ़ करें',
    stopAudio: 'ऑडियो बंद करें',
    savePdfTitle: 'महत्वपूर्ण बिंदुओं और समयरेखा को PDF के रूप में सहेजें',
    quizTitle: 'आपने जो सीखा उस पर एक प्रश्नोत्तरी लें',
    micTitle: 'अपना प्रश्न बोलें',
    micTitleNotSupported: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है',
    stopMicTitle: 'सुनना बंद करें'
  },
  nl: {
    greeting: (f) => `Groeten! Ik ben ${f}. Ik deel graag kennis over mijn tijdperk en expertise. Wat wilt u weten?`,
    askPlaceholder: (f) => `Vraag ${f} over hun tijdperk...`,
    stopMic: 'Stop Microfoon',
    speak: 'Spreken',
    send: 'Verzenden',
    clear: 'Wissen',
    stop: 'Stop',
    savePdf: 'Samenvatting PDF Opslaan',
    preparing: 'Voorbereiden…',
    thinking: (f) => `${f} denkt na...`,
    readAloud: '🔊 Hardop voorlezen',
    clearTitle: 'Huidige chat wissen',
    stopAudio: 'Audio stoppen',
    savePdfTitle: 'Belangrijke punten en tijdlijn opslaan als PDF',
    quizTitle: 'Doe een quiz over wat je hebt geleerd',
    micTitle: 'Spreek uw vraag uit',
    micTitleNotSupported: 'Spraak invoer niet ondersteund in deze browser',
    stopMicTitle: 'Stop met luisteren'
  },
  pl: {
    greeting: (f) => `Pozdrowienia! Jestem ${f}. Z przyjemnością podzielę się wiedzą o mojej epoce i wiedzy specjalistycznej. Co chciałbyś wiedzieć?`,
    askPlaceholder: (f) => `Zapytaj ${f} o ich epokę...`,
    stopMic: 'Zatrzymaj mikrofon',
    speak: 'Mów',
    send: 'Wyślij',
    clear: 'Wyczyść',
    stop: 'Stop',
    savePdf: 'Zapisz podsumowanie PDF',
    preparing: 'Przygotowanie…',
    thinking: (f) => `${f} myśli...`,
    readAloud: '🔊 Czytaj na głos',
    clearTitle: 'Wyczyść bieżący czat',
    stopAudio: 'Zatrzymaj audio',
    savePdfTitle: 'Zapisz ważne punkty i oś czasu jako PDF',
    quizTitle: 'Rozwiąż quiz o tym, czego się nauczyłeś',
    micTitle: 'Powiedz swoje pytanie',
    micTitleNotSupported: 'Wprowadzanie głosowe nie jest obsługiwane w tej przeglądarce',
    stopMicTitle: 'Przestań słuchać'
  },
  tr: {
    greeting: (f) => `Selamlar! Ben ${f}. Dönemim ve uzmanlığım hakkında bilgi paylaşmaktan mutluluk duyarım. Ne öğrenmek istersiniz?`,
    askPlaceholder: (f) => `${f}'e dönemleri hakkında sorun...`,
    stopMic: 'Mikrofonu Durdur',
    speak: 'Konuş',
    send: 'Gönder',
    clear: 'Temizle',
    stop: 'Dur',
    savePdf: 'Özet PDF Kaydet',
    preparing: 'Hazırlanıyor…',
    thinking: (f) => `${f} düşünüyor...`,
    readAloud: '🔊 Sesli oku',
    clearTitle: 'Mevcut sohbeti temizle',
    stopAudio: 'Sesi durdur',
    savePdfTitle: 'Önemli noktaları ve zaman çizelgesini PDF olarak kaydet',
    quizTitle: 'Öğrendikleriniz hakkında bir sınav yapın',
    micTitle: 'Sorunuzu söyleyin',
    micTitleNotSupported: 'Bu tarayıcıda ses girişi desteklenmiyor',
    stopMicTitle: 'Dinlemeyi durdur'
  },
  sv: {
    greeting: (f) => `Hälsningar! Jag är ${f}. Jag är glad att dela kunskap om min era och expertis. Vad vill du veta?`,
    askPlaceholder: (f) => `Fråga ${f} om deras era...`,
    stopMic: 'Stoppa mikrofon',
    speak: 'Tala',
    send: 'Skicka',
    clear: 'Rensa',
    stop: 'Stoppa',
    savePdf: 'Spara sammanfattning PDF',
    preparing: 'Förbereder…',
    thinking: (f) => `${f} tänker...`,
    readAloud: '🔊 Läs högt',
    clearTitle: 'Rensa nuvarande chatt',
    stopAudio: 'Stoppa ljud',
    savePdfTitle: 'Spara viktiga punkter och tidslinje som PDF',
    quizTitle: 'Ta ett quiz om vad du lärde dig',
    micTitle: 'Säg din fråga',
    micTitleNotSupported: 'Röstinmatning stöds inte i denna webbläsare',
    stopMicTitle: 'Sluta lyssna'
  },
  da: {
    greeting: (f) => `Hilsner! Jeg er ${f}. Jeg er glad for at dele viden om min æra og ekspertise. Hvad vil du gerne vide?`,
    askPlaceholder: (f) => `Spørg ${f} om deres æra...`,
    stopMic: 'Stop mikrofon',
    speak: 'Tal',
    send: 'Send',
    clear: 'Ryd',
    stop: 'Stop',
    savePdf: 'Gem resumé PDF',
    preparing: 'Forbereder…',
    thinking: (f) => `${f} tænker...`,
    readAloud: '🔊 Læs højt',
    clearTitle: 'Ryd nuværende chat',
    stopAudio: 'Stop lyd',
    savePdfTitle: 'Gem vigtige punkter og tidslinje som PDF',
    quizTitle: 'Tag en quiz om hvad du lærte',
    micTitle: 'Sig dit spørgsmål',
    micTitleNotSupported: 'Stemmeinput understøttes ikke i denne browser',
    stopMicTitle: 'Stop med at lytte'
  },
  fi: {
    greeting: (f) => `Tervehdys! Olen ${f}. Olen iloinen voidessani jakaa tietoa aikakaudestani ja asiantuntemuksestani. Mitä haluaisit tietää?`,
    askPlaceholder: (f) => `Kysy ${f}:ltä heidän aikakaudestaan...`,
    stopMic: 'Pysäytä mikrofoni',
    speak: 'Puhu',
    send: 'Lähetä',
    clear: 'Tyhjennä',
    stop: 'Pysäytä',
    savePdf: 'Tallenna yhteenveto PDF',
    preparing: 'Valmistellaan…',
    thinking: (f) => `${f} ajattelee...`,
    readAloud: '🔊 Lue ääneen',
    clearTitle: 'Tyhjennä nykyinen keskustelu',
    stopAudio: 'Pysäytä ääni',
    savePdfTitle: 'Tallenna tärkeät kohdat ja aikajana PDF-muodossa',
    quizTitle: 'Tee tietokilpailu oppimastasi',
    micTitle: 'Sano kysymyksesi',
    micTitleNotSupported: 'Puhesyöttöä ei tueta tässä selaimessa',
    stopMicTitle: 'Lopeta kuunteleminen'
  },
  no: {
    greeting: (f) => `Hilsener! Jeg er ${f}. Jeg er glad for å dele kunnskap om min æra og ekspertise. Hva vil du vite?`,
    askPlaceholder: (f) => `Spør ${f} om deres æra...`,
    stopMic: 'Stopp mikrofon',
    speak: 'Snakk',
    send: 'Send',
    clear: 'Tøm',
    stop: 'Stopp',
    savePdf: 'Lagre sammendrag PDF',
    preparing: 'Forbereder…',
    thinking: (f) => `${f} tenker...`,
    readAloud: '🔊 Les høyt',
    clearTitle: 'Tøm nåværende chat',
    stopAudio: 'Stopp lyd',
    savePdfTitle: 'Lagre viktige punkter og tidslinje som PDF',
    quizTitle: 'Ta en quiz om det du lærte',
    micTitle: 'Si spørsmålet ditt',
    micTitleNotSupported: 'Taleinntasting støttes ikke i denne nettleseren',
    stopMicTitle: 'Slutt å lytte'
  }
}

export function ChatInterface({ figure }: { figure: string }) {
  // Load saved language from localStorage
  const [language, setLanguage] = useState<LangCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronos-language')
      return (saved as LangCode) || 'en'
    }
    return 'en'
  })

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: translations['en'].greeting(figure),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [sttSupported, setSttSupported] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [figureGender, setFigureGender] = useState<'male' | 'female'>('male')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chronos-language', language)
    }
  }, [language])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  // Get current language translations
  const t = translations[language as LangCode]

  // Update greeting message when language changes
  useEffect(() => {
    setMessages((prev: Message[]) => {
      if (prev.length > 0 && prev[0].role === 'assistant') {
        // Update the first message with the new language greeting
        return [{...prev[0], content: t.greeting(figure)}, ...prev.slice(1)]
      }
      return prev
    })
  }, [language, figure, t])

  // Load available TTS voices
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  // Detect Speech-to-Text support (Web Speech API)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    setSttSupported(supported)
  }, [])

  // Removed Wikipedia integration

  // Detect figure gender for voice selection
  useEffect(() => {
    const detectGender = async () => {
      try {
        const r = await fetch('/api/figure-gender', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ figure })
        })
        if (r.ok) {
          const data = await r.json()
          setFigureGender(data?.gender || 'male')
        }
      } catch {}
    }
    if (figure) detectGender()
  }, [figure])

  const langToBCP47 = (lang: LangCode): string => {
    switch (lang) {
      case 'en': return 'en-US'
      case 'hi': return 'hi-IN'
      case 'es': return 'es-ES'
      case 'fr': return 'fr-FR'
      case 'de': return 'de-DE'
      case 'it': return 'it-IT'
      case 'ar': return 'ar-SA'
      case 'zh': return 'zh-CN'
      case 'ja': return 'ja-JP'
      case 'pt': return 'pt-PT'
      case 'ru': return 'ru-RU'
      case 'ko': return 'ko-KR'
      case 'nl': return 'nl-NL'
      case 'pl': return 'pl-PL'
      case 'tr': return 'tr-TR'
      case 'sv': return 'sv-SE'
      case 'da': return 'da-DK'
      case 'fi': return 'fi-FI'
      case 'no': return 'no-NO'
      default: return 'en-US'
    }
  }

  // Add speech variations like coughs and laughs
  const addSpeechVariations = (text: string): string => {
    const sentences = text.split(/([.!?]+)/).filter(s => s.trim())
    const variations = [
      { chance: 0.05, sound: '*cough* ' },
      { chance: 0.03, sound: '*chuckles* ' },
      { chance: 0.02, sound: '*thoughtful pause* ' },
    ]

    let result = ''
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      // Maybe add a variation before this sentence
      if (i > 0 && Math.random() < 0.1) {
        const variation = variations.find(v => Math.random() < v.chance)
        if (variation) result += variation.sound
      }
      result += sentence
    }
    return result
  }

  const speakText = async (text: string) => {
    // Stop any current audio
    stopSpeech()
    setIsSpeaking(true)

    // Add speech variations
    const textWithVariations = addSpeechVariations(text)

    try {
      // If non-English, prefer browser TTS so locale/voice matches immediately
      if (language !== 'en') {
        useBrowserTTS(text)
        return
      }

      // Try Murf AI TTS first with gender-based voice selection
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textWithVariations, gender: figureGender, language })
      })

      const data = await response.json()

      if (data.fallbackToBrowser) {
        // Fallback to browser TTS if Murf fails or is not configured
        useBrowserTTS(text)
        return
      }

      if (data.audioData) {
        // Convert base64 to blob and play
        const audioBlob = base64ToBlob(data.audioData, data.mimeType || 'audio/mpeg')
        const audioUrl = URL.createObjectURL(audioBlob)

        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS on error
          useBrowserTTS(text)
        }

        await audio.play()
      } else {
        useBrowserTTS(text)
      }
    } catch (error) {
      console.error('Murf AI TTS error:', error)
      // Fallback to browser TTS
      useBrowserTTS(text)
    }
  }

  const useBrowserTTS = (text: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    const target = langToBCP47(language)
    utterance.lang = target
    const voice = voices.find(v => v.lang?.toLowerCase().startsWith(target.slice(0,2).toLowerCase()))
    if (voice) utterance.voice = voice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  const stopSpeech = () => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    // Stop browser TTS
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // Speech-to-Text: start/stop microphone and fill the input
  const toggleListening = () => {
    if (!sttSupported || loading) return
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = langToBCP47(language)
    rec.interimResults = true
    rec.maxAlternatives = 1
    let finalTranscript = ''
    rec.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) finalTranscript += res[0].transcript
        else interim += res[0].transcript
      }
      const text = (finalTranscript || interim).trim()
      if (text) setInput(text)
    }
    rec.onend = () => { setIsListening(false); recognitionRef.current = null }
    rec.onerror = () => { setIsListening(false) }
    try {
      rec.start()
      recognitionRef.current = rec
      setIsListening(true)
    } catch {}
  }

  // Progress persistence helpers
  type StoredBadge = { id: string; name: string; description: string; icon: string }
  type Progress = {
    points: number
    badges: StoredBadge[]
    figures: { [name: string]: { quizzes: number; perfect: boolean } }
  }

  const getProgress = (): Progress => {
    if (typeof window === 'undefined') return { points: 0, badges: [], figures: {} }
    try {
      const raw = localStorage.getItem('historica-progress')
      if (!raw) return { points: 0, badges: [], figures: {} }
      const parsed = JSON.parse(raw)
      return {
        points: parsed.points ?? 0,
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        figures: parsed.figures ?? {},
      }
    } catch {
      return { points: 0, badges: [], figures: {} }
    }
  }

  const saveProgress = (p: Progress) => {
    try { localStorage.setItem('historica-progress', JSON.stringify(p)) } catch {}
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figure,
          messages: [...messages, { role: "user", content: userMessage }],
          language,
        }),
      })
      if (!response.ok) throw new Error("Failed to get response")
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
      speakText(data.message)
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I cannot continue this conversation at the moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (exporting) return
    try {
      setExporting(true)
      const resp = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figure, messages, language }),
      })
      if (!resp.ok) throw new Error('Failed to create summary')
      const data = await resp.json()

      const title = `Chronos Guru - ${figure} Summary`
      const styles = `
        body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px;color:#111}
        h1{font-size:24px;margin:0 0 8px}
        h2{font-size:18px;margin:24px 0 8px}
        .muted{color:#555}
        ul{margin:0 0 16px 20px}
        li{margin:6px 0}
        table{border-collapse:collapse;width:100%;margin-top:8px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        th{background:#f6f6f6}
        .footer{margin-top:24px;font-size:12px;color:#777}
      `
      const pointsHtml = Array.isArray(data.points) && data.points.length
        ? '<ul>' + data.points.map((p: string) => `<li>${p}</li>`).join('') + '</ul>'
        : '<p class="muted">No key points available.</p>'
      const timelineHtml = Array.isArray(data.timeline) && data.timeline.length
        ? '<table><thead><tr><th>Date</th><th>Event</th></tr></thead><tbody>' +
          data.timeline.map((t: any) => `<tr><td>${t.date}</td><td>${t.event}</td></tr>`).join('') +
          '</tbody></table>'
        : '<p class="muted">No timeline items available.</p>'

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${styles}</style></head>
        <body>
          <h1>${figure}</h1>
          <div class="muted">Learning summary generated from your Chronos Guru conversation.</div>
          <h2>Important Points</h2>
          ${pointsHtml}
          <h2>Timeline</h2>
          ${timelineHtml}
          <div class="footer">Saved from Chronos Guru - ${new Date().toLocaleString()}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body></html>`

      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(html)
        w.document.close()
      } else {
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch (e) {
      console.error(e)
      alert('Unable to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col min-h-[60vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`
                  max-w-md px-4 py-3 rounded-lg group
                  ${
                    msg.role === "user"
                      ? "bg-[#d97706] text-white shadow-md"
                      : "bg-[#f5e6d3] dark:bg-slate-700 text-[#5f2712] dark:text-amber-50 shadow-sm border border-[#d4a574]"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                {msg.englishTranslation && language !== 'en' && (
                  <p className="text-xs mt-2 opacity-50 italic leading-relaxed whitespace-pre-line border-t border-current/20 pt-2">
                    {msg.englishTranslation}
                  </p>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity text-[#8e7555] hover:text-[#5f2712]"
                    title={t.readAloud}
                  >
                    {t.readAloud}
                  </button>
                )}
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f5e6d3] dark:bg-slate-700 px-4 py-3 rounded-lg flex gap-2 border border-[#d4a574] shadow-sm">
                <Spinner className="w-4 h-4" />
                <span className="text-sm text-[#5f2712] dark:text-amber-50">{t.thinking(figure)}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 items-center">
          <select
            value={language}
            className="border-2 border-[#d4a574] dark:border-slate-600 rounded px-2 py-2 bg-[#fffaf5] dark:bg-slate-800 text-sm text-[#5f2712] dark:text-amber-100 shadow-sm"
            onChange={(e) => setLanguage(e.target.value as LangCode)}
            title="Language"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="nl">Dutch</option>
            <option value="pl">Polish</option>
            <option value="tr">Turkish</option>
            <option value="sv">Swedish</option>
            <option value="da">Danish</option>
            <option value="fi">Finnish</option>
            <option value="no">Norwegian</option>
          </select>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t.askPlaceholder(figure)}
            disabled={loading}
            className="border-2 border-[#d4a574] dark:border-slate-600 bg-[#fffaf5] text-[#5f2712] placeholder:text-[#a38d68] shadow-sm"
          />
          <Button
            onClick={toggleListening}
            disabled={loading || !sttSupported}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-[#d97706] hover:bg-[#b45309]'} text-white`}
            title={sttSupported ? (isListening ? t.stopMicTitle : t.micTitle) : t.micTitleNotSupported}
          >
            {isListening ? t.stopMic : t.speak}
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[#d97706] hover:bg-[#b45309] text-white"
          >
            {t.send}
          </Button>
          <Button
            onClick={() => {
              setInput("")
              setMessages([
                { role: 'assistant', content: t.greeting(figure) },
              ])
            }}
            disabled={loading}
            variant="secondary"
            className="bg-[#f5e6d3] hover:bg-[#e8d4bb] text-[#5f2712] border-2 border-[#d4a574] dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white shadow-sm"
            title={t.clearTitle}
          >
            {t.clear}
          </Button>
          {isSpeaking && (
            <Button onClick={stopSpeech} className="bg-red-600 hover:bg-red-700 text-white" title={t.stopAudio}>
              {t.stop}
            </Button>
          )}
        </div>
      </div>

      {/* Floating actions */}
      <div className="fixed bottom-8 left-8 flex gap-3 z-40">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="w-auto px-4 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-[#d97706] hover:bg-[#b45309] text-white"
          title={t.savePdfTitle}
        >
          {exporting ? t.preparing : t.savePdf}
        </button>

        <button
          onClick={() => setIsQuizOpen(true)}
          disabled={messages.length < 3}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-[#d97706] hover:bg-[#b45309] text-white"
          title={t.quizTitle}
        >
          🧪
        </button>
      </div>

      {/* Quiz modal */}
      <QuizModal
        figure={figure}
        messages={messages}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={async ({ score, total, wrong, badges }) => {
          try {
            const r = await fetch('/api/reflection', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ figure, score, total, wrong, language }),
            })
            if (r.ok) {
              const data = await r.json()
              setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
            } else {
              // Fallback if API fails
              const badgeList = badges.map((b) => `${b.icon} ${b.name}`).join(', ')
              const wrongList = wrong.length
                ? `\n\nOh! It seems a few details about me got a bit tangled. Let me clarify in my own words:` +
                  '\n' + wrong.map((w, i) => `\n${i + 1}) ${w.question}\n• You said: ${w.userAnswer}\n• Actually: ${w.correctAnswer}\n• My take: ${w.explanation}`).join('\n')
                : `\nBrilliant — you understood me perfectly!`
              const summary = `You scored ${score}/${total}.` + (badgeList ? `\nBadges earned: ${badgeList}.` : '') + `\n` + `As ${figure}, here’s how I’d put it:` + wrongList
              setMessages((prev) => [...prev, { role: 'assistant', content: summary }])
            }
          } catch {
            // Silent fallback handled above
          }

          // Update progress: 10 points per correct, +10 bonus for perfect
          const bonus = score === total ? 10 : 0
          const add = score * 10 + bonus
          const progress = getProgress()
          progress.points = (progress.points ?? 0) + add
          const existing = new Map<string, StoredBadge>()
          for (const b of progress.badges) existing.set(b.id, b)
          for (const b of badges) existing.set(b.id, { id: b.id, name: b.name, description: b.description, icon: b.icon })
          progress.badges = Array.from(existing.values())
          if (!progress.figures[figure]) progress.figures[figure] = { quizzes: 0, perfect: false }
          progress.figures[figure].quizzes += 1
          if (score === total) progress.figures[figure].perfect = true
          saveProgress(progress)
        }}
      />
    </>
  )
}
