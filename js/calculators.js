// 대학별 점수 계산 설정 및 공식
const univConfigs = {
    '건국대': {
        cutType: '70%',
        calculator: function(s, type) {
            const engScores = [200, 197, 194, 190, 185, 180, 170, 160, 150];
            const hisPenalties = [0, 0, 0, 0, -1, -1.75, -3, -4.25, -5];
            const engVal = engScores[s.eng - 1];
            const hisVal = hisPenalties[s.his - 1];
            let w = (type === 'a') ? {k:0.4, m:0.3} : {k:0.3, m:0.4};
            return parseFloat(((( (s.kor*w.k) + (s.mat*w.m) + (s.tam1*0.2) + (s.tam2*0.2) + (engVal*0.1) + hisVal ) / 200) * 1000).toFixed(2));
        }
    },
    '경희대': {
        cutType: '80%',
        engScores: [0, 0, -2, -4, -8, -12, -18, -24, -30],
        hisPenalties: [0, 0, 0, 0, -2, -4, -8, -14, -20],
        calculator: function(s, type) {
            const engVal = this.engScores[s.eng - 1];
            const hisVal = this.hisPenalties[s.his - 1];
            let weightedSum = 0;
            let sciBonus = 0;
            if (type === '인문') weightedSum = ((s.kor * 0.40 + s.mat * 0.25 + (s.tam1 + s.tam2) * 0.35) / 2) * 6;
            else if (type === '사회') weightedSum = ((s.kor * 0.35 + s.mat * 0.35 + (s.tam1 + s.tam2) * 0.30) / 2) * 6;
            else if (type === '자연') {
                weightedSum = ((s.kor * 0.25 + s.mat * 0.40 + (s.tam1 + s.tam2) * 0.35) / 2) * 6;
                if (s.tam1_type === '과탐') sciBonus += 4;
                if (s.tam2_type === '과탐') sciBonus += 4;
            }
            return parseFloat((weightedSum + engVal + hisVal + sciBonus).toFixed(2));
        }
    },
    '연세대': {
        cutType: '70%',
        engScores: [100, 95, 87.5, 75, 60, 40, 25, 12.5, 5],
        hisPenalties: [0, 0, 0, 0, -0.2, -0.4, -0.6, -0.8, -1],
        calculator: function(s, type) {
            const engVal = this.engScores[s.eng - 1];
            const hisVal = this.hisPenalties[s.his - 1];
            let t1 = s.tam1;
            let t2 = s.tam2;

            if (type === '유형1') {
                if (s.tam1_type === '사탐') t1 *= 1.03;
                if (s.tam2_type === '사탐') t2 *= 1.03;
                return parseFloat((((s.kor * 1.5 + s.mat + engVal + t1 + t2 + hisVal) * 1000) / 800).toFixed(2));
            } 
            else if (type === '유형2') {
                if (s.tam1_type === '과탐') t1 *= 1.03;
                if (s.tam2_type === '과탐') t2 *= 1.03;
                return parseFloat((((s.kor + s.mat * 1.5 + engVal + (t1 + t2) * 1.5 + hisVal) * 1000) / 900).toFixed(2));
            } 
            else if (type === '유형3') {
                return parseFloat((((s.kor + s.mat + engVal + t1 + t2 + hisVal) * 1000) / 600).toFixed(2));
            }
            return 0;
        }
    },
    '고려대': {
        cutType: '70%',
        engScores: [0, -3, -6, -9, -12, -15, -18, -21, -24],
        hisPenalties: [0, 0, 0, 0, -0.2, -0.4, -0.6, -0.8, -2],
        calculator: function(s, type) {
            const engVal = this.engScores[s.eng - 1];
            const hisVal = this.hisPenalties[s.his - 1];
            let t1 = s.tam1;
            let t2 = s.tam2;
            if (type === 'K1') {
                if (s.tam1_type === '과탐') t1 *= 1.03;
                if (s.tam2_type === '과탐') t2 *= 1.03;
            }

            let score = 0;
            if (type === 'K1') {
                score = (((s.kor + (s.mat * 1.2) + t1 + t2) / 640) * 1000) + engVal + hisVal;
            } else if (type === 'K2') {
                score = (((s.kor + s.mat + (t1 + t2) * 0.8) / 640) * 1000) + engVal + hisVal;
            }
            return parseFloat(score.toFixed(2));
        }
    }
};
