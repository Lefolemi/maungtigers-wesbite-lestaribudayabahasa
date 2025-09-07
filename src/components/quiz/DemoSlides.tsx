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
    { title: "Kenapa bahasa?", content: "Bahasa bukan cuma alat komunikasi. Ia adalah wadah budaya, menyimpan cara berpikir, sejarah, adat istiadat, mitos, dan nilai-nilai suatu komunitas. Dengan mempelajari bahasa, kita juga belajar cara komunitas itu melihat dunia." },
    { title: "Koneksi bahasa dan budaya", content: "Bahasa daerah tidak hanya sebagai alat komunikasi, tetapi juga sebagai penyimpan nilai-nilai budaya, adat istiadat, dan identitas kultural. Setiap bahasa mampu mencerminkan kekayaan budaya yang unik dari wilayahnya masing-masing." },
    { title: "Bahasa daerah di Indonesia", content: "Indonesia memiliki sekitar 718 bahasa daerah yang tersebar di seluruh nusantara. Bahasa Jawa, Sunda, Madura, Minangkabau, Batak, Aceh, Bali, dan Sasak adalah beberapa contoh bahasa daerah yang banyak digunakan." },
    {
    title: "Contoh bahasa daerah",
    content: `
- Kata “Lemah” berasal dari Bahasa Sunda, artinya “tanah” atau “bumi”
- Kata “Nyepi” berasal dari Bahasa Bali, artinya “hari raya keheningan”
- Kata “Sigup” berasal dari Bahasa Batak Toba, artinya “cepat atau tangkas”
- Kata “Ranah” berasal dari Bahasa Minangkabau, artinya “wilayah atau daerah”
- Kata “Siri’” berasal dari Bahasa Bugis, artinya “harga diri atau martabat”
- Kata “Meuseuraya” berasal dari Bahasa Aceh, artinya “bersatu”
    `
  },
    {
        title: 'Quiz! Kata "Sigup" berasal dari daerah?',
        isQuiz: true,
        quizQuestions: [
        {
            question: 'Kata "Sigup" berasal dari daerah mana?',
            options: ["Batak Toba", "Sunda", "Aceh", "Bali"],
            correctIndex: 0,
        },
        ],
    },
    { title: "Keunikan-keunikan dalam bahasa daerah di Indonesia", content: `
Bahasa daerah di Indonesia sangat beragam, dengan lebih dari 700 bahasa yang tercatat. Beberapa keunikan meliputi:”
- Fonologi yang unik: misal bahasa Batak memiliki nada tinggi-rendah (tonal) yang memengaruhi arti kata.”
- Struktur tata bahasa berbeda: seperti bahasa Ternate yang memiliki urutan kata berbeda dibandingkan bahasa Indonesia.”
- Kekayaan kosakata lokal: banyak istilah budaya atau alam yang tidak ada padanan langsung dalam bahasa lain.”
- Idiom dan peribahasa: misal bahasa Minangkabau: “Alah bisa karena biasa” menggambarkan filosofi hidup masyarakat”
- Bahasa isyarat lokal: beberapa komunitas memiliki bahasa isyarat sendiri yang tidak sama dengan bahasa isyarat nasional.”
    ` },
    { title: "Itu kenapa... melestarikan bahasa sangat penting dalam melestarikan budaya di era digital", content: `
Melestarikan bahasa daerah berarti melestarikan cara pandang, adat, sejarah, dan pengetahuan lokal. Di era digital:”
- Dokumentasi bahasa secara daring membuat generasi muda mudah mengakses pengetahuan tradisional.”
- Bahasa adalah jembatan budaya: mengajarkan nilai-nilai, filosofi, dan tradisi masyarakat.”
- Tanpa bahasa, cerita rakyat, ritual, dan ilmu lokal dapat hilang.”
- Teknologi memungkinkan bahasa yang hampir punah bisa diajarkan, dicatat, dan dibagikan luas.”
    ` },
    { title: "Indonesia adalah negara dengan bahasa hampir punah terbanyak", content: `
Indonesia memiliki sekitar 700+ bahasa daerah, dan menurut UNESCO, lebih dari 100 bahasa terancam punah.
Faktor ancaman: urbanisasi, dominasi bahasa Indonesia, kurangnya penutur muda, dan kurang dokumentasi formal.
Bahasa yang hilang berarti hilangnya identitas lokal, budaya, dan pengetahuan tradisional.”
    ` },
    { title: "Usaha-usaha dalam melestarikan bahasa daerah yang hampir punah", content: `
Dokumentasi digital: misal LADIN (BRIN) yang menyimpan rekaman audio, video, teks bahasa daerah.
Workshop dan kursus bahasa daerah: beberapa universitas, seperti Universitas Jambi, mengadakan pelatihan bahasa lokal.
Pengajaran di sekolah: kurikulum inklusif bahasa daerah di beberapa daerah (contoh: Bali, Papua).
Media daring dan aplikasi pembelajaran: aplikasi seperti Anki, Duolingo (proyek pilot), YouTube untuk belajar bahasa lokal.
Publikasi buku, kamus, dan cerita rakyat: agar pengetahuan budaya tetap terdokumentasi dan tersebar.
    ` },
    {
        title: "Quiz! Berikut ini adalah lembaga pelestarian bahasa daerah kecuali...",
        isQuiz: true,
        quizQuestions: [
        {
            question: "Lembaga mana berikut bukan lembaga pelestarian bahasa?",
            options: ["BRIN", "LADIN", "UNESCO", "BUMN"],
            correctIndex: 3,
        },
        ],
    },
    {
        title: "Dengan informasi itu, bagaimana bahasa daerah bisa dilestarikan di Indonesia?",
        content: "Bahasa daerah dapat dilestarikan melalui kombinasi teknologi, pendidikan, dan kesadaran masyarakat. Dokumentasi digital, pengajaran di sekolah, serta publikasi cerita rakyat dan kamus digital memungkinkan bahasa tetap hidup dan diakses oleh generasi muda. Selain itu, kesadaran masyarakat untuk menggunakan dan membagikan bahasa lokal dalam kehidupan sehari-hari juga sangat penting."
    },
    {
        title: "Berikut contoh pelestarian bahasa daerah dengan mendokumentasikan bahasa daerah di Indonesia",
        content: "Salah satu contoh nyata pelestarian bahasa daerah melalui dokumentasi dilakukan oleh Pusat Riset Preservasi Bahasa dan Sastra (PRPBS) di bawah Badan Riset dan Inovasi Nasional (BRIN). PRPBS bersama Direktorat Repositori, Multimedia, dan Penerbitan Ilmiah, serta Pusat Data dan Informasi, mengembangkan sistem dokumentasi bahasa daerah berbasis digital yang dikenal dengan nama LADIN (Language Documentation of Indonesia). LADIN berfungsi sebagai repositori digital untuk menyimpan dan mengakses data bahasa-bahasa daerah di Indonesia, termasuk rekaman audio, video, dan transkripsi teks. Inisiatif ini bertujuan untuk melestarikan bahasa daerah yang terancam punah dan memudahkan akses bagi peneliti, pendidik, dan masyarakat umum."
    },
    {
        title: "Setelah didokumentasikan, data bisa dijadikan sebagai...",
        content: "Setelah didokumentasikan, data bahasa daerah bisa digunakan sebagai materi pembelajaran, referensi budaya, bahan penelitian linguistik, sumber kamus digital, maupun konten pendidikan daring. Ini memastikan bahwa bahasa tidak hanya terdokumentasi tapi juga memiliki kegunaan nyata dalam pengajaran dan pelestarian budaya."
    },
    {
        title: "Semakin luas jangkauan pembelajaran, semakin banyak yang tertarik akan budaya dibalik bahasa tersebut",
        content: "Dengan menyebarkan informasi dan materi pembelajaran melalui platform digital, media sosial, aplikasi, dan kursus daring, lebih banyak orang dari berbagai wilayah dapat belajar bahasa daerah. Semakin banyak yang memahami bahasa, semakin besar pula minat terhadap budaya, tradisi, dan filosofi lokal yang melekat pada bahasa tersebut."
    },
    {
        title: "Quiz! Apa pentingnya mendokumentasikan bahasa daerah?",
        isQuiz: true,
        quizQuestions: [
            {
                question: "Mengapa mendokumentasikan bahasa daerah penting?",
                options: [
                  "Menghilangkan bahasa",
                  "Menyimpan sejarah budaya",
                  "Membuat game",
                  "Tidak penting"
                ],
                correctIndex: 1, // Menyimpan sejarah budaya
            },
            {
                question: "Dokumentasi bahasa daerah dapat berupa?",
                options: [
                    "Rekaman audio dan video",
                    "Hanya menulis cerita sendiri",
                    "Menghapus kata-kata lama",
                    "Membuat puisi baru"
                ],
                correctIndex: 0, // Rekaman audio dan video
            },
            {
                question: "Siapa yang bisa menggunakan hasil dokumentasi bahasa daerah?",
                options: [
                    "Hanya pemerintah",
                    "Peneliti, pendidik, dan masyarakat umum",
                    "Hanya mahasiswa bahasa",
                    "Tidak ada yang bisa mengakses"
                ],
                correctIndex: 1, // Peneliti, pendidik, dan masyarakat umum
            },
        ],
    },
    { 
        title: "Tantangan: Bahasa tidak hanya harus bermanfaat tapi juga relevan", 
        content: "Bahasa daerah harus tetap hidup dalam kehidupan sehari-hari, tidak hanya di buku atau dokumen, agar generasi muda bisa menggunakannya dalam konteks modern." 
    },
    { 
        title: "Case study: Bagaimana hangul membantu pelestarian bahasa Cia-Cia", 
        content: "Bahasa Cia-Cia di Sulawesi Tenggara hampir punah, tetapi dengan adopsi sistem penulisan Hangul Korea untuk mendokumentasikan alfabet dan kosa kata mereka, generasi muda bisa belajar menulis dan membaca bahasa asli mereka, menunjukkan bagaimana digitalisasi alfabet bisa membantu pelestarian bahasa." 
    },
    { 
        title: "Melestarikan bahasa secara digital dengan aplikasi seperti Anki", 
        content: "Aplikasi seperti Anki memungkinkan membuat flashcards interaktif untuk kosakata bahasa daerah, memudahkan pembelajaran dan memperluas jangkauan pelestarian bahasa melalui media digital." 
    },
    {
        title: 'Quiz! Kata "..." dalam bahasa "..." artinya...',
        isQuiz: true,
        quizQuestions: [
            {
                question: 'Kata "Ngabuburit" artinya apa?',
                options: ["Makan", "Menunggu waktu buka puasa", "Tidur", "Belajar"],
                correctIndex: 1,
            },
            {
                question: 'Kata "Gotong royong" dalam bahasa Indonesia artinya?',
                options: ["Kerja sama masyarakat", "Berkumpul teman", "Liburan", "Bertengkar"],
                correctIndex: 0,
            },
            {
                question: 'Kata "Sasak" adalah nama suku di mana?',
                options: ["Bali", "NTB", "Sumatra", "Papua"],
                correctIndex: 1,
            },
        ],
    },
    { 
        title: "Masalah: Belajar bahasa online itu sia-sia jika tidak mengerti konteks budayanya", 
        content: "Belajar bahasa tanpa memahami konteks budaya bisa membuat kosakata dan idiom tidak relevan. Bahasa bukan hanya kata, tapi cerminan cara hidup, tradisi, dan nilai suatu masyarakat." 
    },
    { 
        title: 'Tahukah kamu? Dalam ..., kata "..." artinya "..." karena "..."', 
        content: "Contoh: Dalam bahasa Minang, kata 'Rantai' artinya 'Ikatan' karena digunakan dalam tradisi mengikat janji dan simbol kekeluargaan." 
    },
    { 
        title: "Banyak arti bahasa dalam banyak budaya di Indonesia!", 
        content: "Setiap daerah memiliki idiom, kosakata, dan ungkapan khas yang mencerminkan nilai budaya mereka. Misalnya, bahasa Jawa, Sunda, Bugis, dan Batak masing-masing memiliki istilah yang tidak dapat diterjemahkan secara literal." 
    },
    {
        title: 'Quiz! idiom "..." dalam bahasa "..." berarti "..." karena...',
        isQuiz: true,
        quizQuestions: [
            {
                question: 'Idiom "Tumpang tindih" dalam bahasa Indonesia berarti?',
                options: ["Saling menimpa", "Berjalan lambat", "Makan bersama", "Tidur"],
                correctIndex: 0,
            },
            {
                question: 'Idiom "Cuci mata" artinya?',
                options: ["Melihat-lihat dengan senang", "Mencuci mata", "Tidur siang", "Makan bersama"],
                correctIndex: 0,
            },
            {
                question: 'Dalam bahasa Jawa, kata "Guyub" berarti?',
                options: ["Rukun dan kompak", "Marah-marah", "Berjalan cepat", "Makan ramai-ramai"],
                correctIndex: 0,
            },
        ],
    },
    { 
        title: "Dengan begini sudah jelas bahasa daerah perlu relevansi denan membagikan cerita dan makna dibalik kata-kata itu", 
        content: "Masyarakat akan lebih menghargai bahasa dan budaya mereka, dan generasi muda terdorong untuk belajar, menggunakan, serta melestarikan bahasa daerah melalui cerita, idiom, dan makna di balik kata-kata tersebut." 
    },      
    { title: "Ayo bagikan cerita dan makna itu dengan bergabung bersama kami!", content: "Gabung dan kontribusi sekarang!" },
];  