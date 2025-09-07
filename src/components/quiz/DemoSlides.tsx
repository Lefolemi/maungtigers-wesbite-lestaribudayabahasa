export interface DemoSlide {
    title: string;
    content?: string;
    isQuiz?: boolean;
    quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    }[];
}
  
export const demoSlides: DemoSlide[] = [
    { title: "Kenapa bahasa?", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { title: "Koneksi bahasa dan budaya", content: "Bahasa adalah jembatan budaya yang penting." },
    { title: "Bahasa daerah di Indonesia", content: "Indonesia memiliki banyak bahasa daerah yang unik." },
    {
        title: 'Quiz! Kata "..." berasal dari daerah?',
        isQuiz: true,
        quizQuestions: [
        {
            question: 'Kata "Ambarawa" berasal dari daerah mana?',
            options: ["Jawa Tengah", "Jawa Barat", "Sumatera", "Bali"],
            correctIndex: 0,
        },
        ],
    },
    { title: "Keunikan-keunikan dalam bahasa daerah di Indonesia", content: "Setiap daerah memiliki kosakata dan ungkapan unik." },
    { title: "Itu kenapa... melestarikan bahasa sangat penting dalam melestarikan budaya di era digital", content: "Bahasa membawa identitas dan sejarah." },
    { title: "Indonesia adalah negara dengan bahasa hampir punah terbanyak", content: "Banyak bahasa daerah menghadapi risiko hilang." },
    { title: "Usaha-usaha dalam melestarikan bahasa daerah yang hampir punah", content: "Dokumentasi dan pendidikan digital adalah kuncinya." },
    {
        title: "Quiz! Berikut ini adalah lembaga pelestarian bahasa daerah kecuali...",
        isQuiz: true,
        quizQuestions: [
        {
            question: "Lembaga mana berikut bukan lembaga pelestarian bahasa?",
            options: ["Komunitas Lokal", "Pemerintah Daerah", "Sekolah", "Netflix"],
            correctIndex: 3,
        },
        ],
    },
    { title: "Bagaimana bahasa daerah bisa dilestarikan?", content: "Dengan teknologi dan kesadaran masyarakat." },
    { title: "Berikut contoh pelestarian bahasa daerah dengan mendokumentasikan bahasa daerah", content: "Membuat kamus, cerita, dan rekaman audio." },
    { title: "Setelah didokumentasikan, data bisa dijadikan sebagai...", content: "Materi pembelajaran atau referensi budaya." },
    { title: "Semakin luas jangkauan pembelajaranm, semakin banyak yang tertarik akan budaya dibalik bahasa tersebut", content: "Penyebaran informasi melalui platform digital." },
    {
        title: "Quiz! Apa pentingnya mendokumentasikan bahasa daerah?",
        isQuiz: true,
        quizQuestions: [
        {
            question: "Mengapa mendokumentasikan bahasa daerah penting?",
            options: ["Menghilangkan bahasa", "Menyimpan sejarah budaya", "Membuat game", "Tidak penting"],
            correctIndex: 1,
        },
        ],
    },
    { title: "Tantangan: Bahasa tidak hanya harus bermanfaat tapi juga relevan", content: "Bahasa harus digunakan dalam konteks modern." },
    { title: "Case study: Bagaimana hangul membantu pelestarian bahasa cia-cia", content: "Contoh sukses digitalisasi alfabet." },
    { title: "Melestarikan bahasa secara digital dengan aplikasi seperti Anki", content: "Membuat flashcards untuk belajar bahasa." },
    {
        title: 'Quiz! Kata "..." dalam bahasa "..." artinya...',
        isQuiz: true,
        quizQuestions: [
        {
            question: 'Kata "Ngabuburit" artinya apa?',
            options: ["Makan", "Menunggu waktu buka puasa", "Tidur", "Belajar"],
            correctIndex: 1,
        },
        ],
    },
    { title: "Masalah: Belajar bahasa online itu sia-sia jika tidak mengerti konteks budayanya", content: "Konteks budaya adalah inti dari pembelajaran bahasa." },
    { title: 'Tahukah kamu? Dalam ..., kata "..." artinya "..." karena "..."', content: "Contoh: Dalam bahasa Minang, kata 'Rantai' artinya 'Ikatan' karena tradisi lokal." },
    { title: "Banyak arti bahasa dalam banyak budaya di Indonesia!", content: "Ragam arti dan makna di setiap daerah." },
    {
        title: 'Quiz! idiom "..." dalam bahasa "..." berarti "..." karena...',
        isQuiz: true,
        quizQuestions: [
        {
            question: 'Idiom "Tumpang tindih" dalam bahasa Indonesia berarti?',
            options: ["Saling menimpa", "Berjalan lambat", "Makan bersama", "Tidur"],
            correctIndex: 0,
        },
        ],
    },
    { title: "Dengan begini sudah jelas bahasa daerah perlu relevansi denan membagikan cerita dan makna dibalik kata-kata itu", content: "Masyarakat akan lebih menghargai bahasa." },
    { title: "Ayo bagikan cerita dan makna itu dengan bergabung bersama kami!", content: "Gabung dan kontribusi sekarang!" },
];  