const KaistMajors = (() => {
    const majorsList = [
        { name: "물리학과", josa: "를" },
        { name: "수리과학과", josa: "를" },
        { name: "화학과", josa: "를" },
        { name: "나노과학기술대학원", josa: "을" },
        { name: "양자대학원", josa: "을" },
        { name: "생명과학과", josa: "를" },
        { name: "뇌인지과학과", josa: "를" },
        { name: "의과학대학원", josa: "을" },
        { name: "공학생물학대학원", josa: "을" },
        { name: "줄기세포및재생생물학대학원", josa: "을" },
        { name: "기계공학과", josa: "를" },
        { name: "항공우주공학과", josa: "를" },
        { name: "전기및전자공학부", josa: "를" },
        { name: "전산학부", josa: "를" },
        { name: "건설및환경공학과", josa: "를" },
        { name: "바이오및뇌공학과", josa: "를" },
        { name: "산업디자인학과", josa: "를" },
        { name: "산업시스템공학과", josa: "를" },
        { name: "생명화학공학과", josa: "를" },
        { name: "신소재공학과", josa: "를" },
        { name: "원자력및양자공학과", josa: "를" },
        { name: "반도체시스템공학과", josa: "를" },
        { name: "조천식모빌리티대학원", josa: "을" },
        { name: "김재철AI대학원", josa: "을" },
        { name: "녹색성장지속가능대학원", josa: "을" },
        { name: "반도체공학대학원", josa: "을" },
        { name: "인공지능반도체대학원", josa: "을" },
        { name: "메타버스대학원", josa: "을" },
        { name: "시스템아키텍트대학원", josa: "을" },
        { name: "디지털인문사회과학부", josa: "를" },
        { name: "문화기술대학원", josa: "을" },
        { name: "문술미래전략대학원", josa: "을" },
        { name: "과학기술정책대학원", josa: "을" },
        { name: "경영공학부", josa: "를" },
        { name: "기술경영학부", josa: "를" },
        { name: "KAIST경영전문대학원", josa: "을" },
        { name: "금융전문대학원", josa: "을" },
        { name: "경영자과정", josa: "을" },
        { name: "기술경영전문대학원", josa: "을" },
        { name: "글로벌디지털혁신대학원", josa: "을" },
        { name: "바이오혁신경영전문대학원", josa: "을" },
        { name: "융합인재학부", josa: "를" },
        { name: "안보과학기술대학원", josa: "을" },
        { name: "사이버안보기술대학원", josa: "을" },
        { name: "새내기과정학부", josa: "를" },
    ];

    const data = {};
    majorsList.forEach(({ name, josa }) => {
        const key = name.toLowerCase().replace(/\s+/g, "");
        data[key] = {
            value: name,
            josa,
            getJosa() {
                return `${this.josa}`;
            },
        };
    });

    return {
        ...data,
        from(input) {
            const key = input.toLowerCase().replace(/\s+/g, "");
            return data[key] || data["Unknown"];
        },
    };
})();

export default KaistMajors;
