// traits.js - 특성 시스템

const TRAITS = {
    // 공격/미드필더 특성
    1: { name: "아크로바티커", position: ["FW", "MF"], condition: "아크로바틱 골", bonus: 2 },
    2: { name: "헤더", position: ["FW", "MF"], condition: "헤더 골 (코너킥 제외)", bonus: 2 },
    3: { name: "패스 마스터", position: ["FW", "MF"], condition: "한 경기 3어시스트", bonus: 3 },
    4: { name: "오프 더 볼", position: ["FW", "MF"], condition: "코너킥 골", bonus: 2 },
    6: { name: "대포", position: ["FW", "MF"], condition: "한 경기 중거리슛 2회", bonus: 2 },
    8: { name: "PK 패스", position: ["FW", "MF"], condition: "페널티킥 성공", bonus: 1 },
    9: { name: "올림피코 골", position: ["FW", "MF"], condition: "코너킥 직접 골", bonus: 3 },
    10: { name: "무회전 슛", position: ["FW", "MF"], condition: "프리킥 직접 골", bonus: 3 },
    11: { name: "TRIVELA", position: ["FW", "MF"], condition: "프리킥 어시스트", bonus: 2 },
    12: { name: "타겟맨", position: ["FW", "MF"], condition: "코너킥 헤더 골", bonus: 2 },
    13: { name: "포처", position: ["FW", "MF"], condition: "빈 공간 침투 골", bonus: 2 },
    14: { name: "트레콰르티스타", position: ["MF"], condition: "미드필더 해트트릭", bonus: 4 },
    15: { name: "드리블러", position: ["FW", "MF"], condition: "5명 제치고 골/어시", bonus: 3 },
    16: { name: "택배 크로스", position: ["FW", "MF"], condition: "크로스 2어시", bonus: 2 },
    17: { name: "라이트닝", position: ["FW", "MF"], condition: "3명 제치기", bonus: 2 },
    18: { name: "피니셔", position: ["FW"], condition: "포트트릭 (4골, 모두 어시스트)", bonus: 4 },
    20: { name: "호르헤 몰리나", position: ["FW", "MF"], condition: "오프 더 볼 장착 + 4골 이상", bonus: 5 },
    22: { name: "어택킹 코드네이션", position: ["FW", "MF"], condition: "1골 2어시", bonus: 3 },
    25: { name: "엔진", position: ["FW", "MF"], condition: "3회 수비 + 2공포", bonus: 3 },
    26: { name: "플레이메이커", position: ["MF"], condition: "4어시스트", bonus: 4 },
    27: { name: "MILLA.", position: ["FW", "MF"], condition: "기회 창출 3회 + 어시 2회 + 멀티골", bonus: 5 },
    49: { name: "개인주의", position: ["FW", "MF"], condition: "솔로골 멀티골", bonus: 3 },
    53: { name: "토네이도", position: ["FW", "MF"], condition: "6-7명 제치기", bonus: 5 },
    54: { name: "세레머니", position: ["FW", "MF"], condition: "친정팀 상대 해트트릭", bonus: 4 },
    55: { name: "결정력 100%", position: ["FW"], condition: "포트트릭으로 비김", bonus: 3 },
    56: { name: "마지막 화살", position: ["FW", "MF"], condition: "89분 골", bonus: 2 },
    57: { name: "전투기", position: ["FW", "MF"], condition: "92분 코너킥 헤더 골", bonus: 4 },
    59: { name: "녹슨 화살", position: ["FW", "MF"], condition: "결승 해트트릭 + 패배", bonus: 2 },
    65: { name: "필드 위 예술사", position: ["FW", "MF"], condition: "토네이도 장착 + 5명 제치고 3공포 + MVP", bonus: 6 },
    66: { name: "배신자", position: ["FW", "MF"], condition: "친정팀 상대 MVP + 2골/2수비", bonus: 3 },
    
    // 수비수 특성
    23: { name: "디펜딩 코드네이션", position: ["DF"], condition: "3회 이상 수비", bonus: 3 },
    28: { name: "슬라이딩 태클", position: ["DF"], condition: "슬라이딩 태클 성공", bonus: 2 },
    29: { name: "클린 태클", position: ["DF"], condition: "클린 태클", bonus: 2 },
    30: { name: "브렉시트 태클", position: ["DF"], condition: "태클로 부상", bonus: 2 },
    32: { name: "가로채기", position: ["DF"], condition: "가로채기", bonus: 2 },
    33: { name: "커맨더", position: ["DF"], condition: "디펜딩 코드네이션 + 3회 수비", bonus: 4 },
    34: { name: "매과이어", position: ["DF"], condition: "수비수 골 (코너킥 제외)", bonus: 3 },
    35: { name: "슈퍼맨", position: ["DF"], condition: "수비수 어시스트", bonus: 3 },
    36: { name: "수비수 공격가담", position: ["DF"], condition: "세컨 어시 or 어시+골", bonus: 3 },
    68: { name: "Mariscal.", position: ["DF"], condition: "브렉시트+클린 태클 보유, 한 특성으로 2경기 승리", bonus: 5 },
    
    // 골키퍼 특성
    37: { name: "GK 위치선정", position: ["GK"], condition: "3세이브", bonus: 2 },
    38: { name: "통솔력", position: ["GK"], condition: "2세이브", bonus: 2 },
    39: { name: "스위퍼 키퍼", position: ["GK"], condition: "수비", bonus: 2 },
    40: { name: "세트피스", position: ["GK"], condition: "골 (코너킥 제외)", bonus: 3 },
    41: { name: "GK 공격가담", position: ["GK"], condition: "골", bonus: 3 },
    42: { name: "GK 코너킥 공격가담", position: ["GK"], condition: "코너킥 골", bonus: 4 },
    43: { name: "팀 하워드", position: ["GK"], condition: "골킥 골", bonus: 5 },
    44: { name: "심리전", position: ["GK"], condition: "PK 선방", bonus: 3 },
    45: { name: "GK 멘탈리티", position: ["GK"], condition: "지는 상황 3선방", bonus: 3 },
    47: { name: "세컨볼 차단", position: ["GK"], condition: "세컨볼 2회 선방", bonus: 2 },
    48: { name: "SORIA.", position: ["GK"], condition: "9선방 이상", bonus: 5 },
    62: { name: "결정적 선방", position: ["GK"], condition: "85-90분 2선방", bonus: 3 },
    
    // 공통 특성
    5: { name: "멘탈리티", position: ["ALL"], condition: "지는 상황 역전골/3선방", bonus: 3 },
    24: { name: "코드네이션", position: ["ALL"], condition: "수비 1회 + 2공포 + MVP", bonus: 4 },
    67: { name: "하드워커", position: ["ALL"], condition: "공포+수비 5회 이상", bonus: 4 }
};

// 특성 체크 함수
function checkTraitUnlock(matchData, player) {
    const unlockedTraits = [];
    const position = player.position;
    
    // 각 특성 조건 체크
    for (let traitId in TRAITS) {
        const trait = TRAITS[traitId];
        
        // 이미 보유한 특성은 건너뛰기
        if (player.traits.includes(parseInt(traitId))) continue;
        
        // 포지션 체크
        if (!trait.position.includes(position) && !trait.position.includes("ALL")) continue;
        
        // 조건별 체크
        let unlocked = false;
        
        switch(parseInt(traitId)) {
            case 3: // 패스 마스터
                if (matchData.assists >= 3) unlocked = true;
                break;
            case 6: // 대포
                if (matchData.longShots >= 2) unlocked = true;
                break;
            case 14: // 트레콰르티스타
                if (position === "MF" && matchData.goals >= 3) unlocked = true;
                break;
            case 18: // 피니셔
                if (matchData.goals >= 4 && matchData.assistedGoals >= 4) unlocked = true;
                break;
            case 22: // 어택킹 코드네이션
                if (matchData.goals >= 1 && matchData.assists >= 2) unlocked = true;
                break;
            case 23: // 디펜딩 코드네이션
                if (matchData.defenses >= 3) unlocked = true;
                break;
            case 25: // 엔진
                if (matchData.defenses >= 3 && (matchData.goals + matchData.assists) >= 2) unlocked = true;
                break;
            case 26: // 플레이메이커
                if (matchData.assists >= 4) unlocked = true;
                break;
            case 37: // GK 위치선정
                if (matchData.saves >= 3) unlocked = true;
                break;
            case 38: // 통솔력
                if (matchData.saves >= 2) unlocked = true;
                break;
            case 48: // SORIA
                if (matchData.saves >= 9) unlocked = true;
                break;
            case 67: // 하드워커
                if ((matchData.goals + matchData.assists + matchData.defenses) >= 5) unlocked = true;
                break;
        }
        
        if (unlocked) {
            unlockedTraits.push(parseInt(traitId));
        }
    }
    
    return unlockedTraits;
}

// 특성 효과 계산
function getTraitBonus(player, matchContext) {
    let bonus = 0;
    const tier = getLeagueTier(player.league);
    
    // 1부 리그에서는 특성 사용 불가
    if (tier === 1) return 0;
    
    player.equippedTraits.forEach(traitId => {
        if (TRAITS[traitId]) {
            bonus += TRAITS[traitId].bonus;
        }
    });
    
    return bonus;
}