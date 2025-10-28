// player.js - 선수 관련 클래스 및 로직

// 한국 이름인지 판별하는 함수
function isKoreanName(name) {
    // 한국 성씨 목록
    const koreanSurnames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍", "전", "고", "문", "양", "손", "배", "백", "허", "남", "심", "노", "하", "곽", "성", "차", "주", "우", "구", "나", "변"];
    
    // 이름의 첫 글자 확인
    const firstChar = name.trim().split(' ')[0];
    return koreanSurnames.includes(firstChar);
}

class Player {
    constructor(name, position, number, team) {
        this.name = name;
        this.position = position;
        this.number = number;
        this.team = team;
        this.league = getTeamLeague(team);
        
        // 이름으로 국적 자동 판별 (시작은 무조건 한국)
        this.nationality = 'korean';
        
        // 기본 능력치
        this.level = 0; // 시작 레벨 (최대 300)
        this.age = 16;
        this.exp = 0; // 레벨 경험치
        
        // 경력 통계
        this.stats = {
            matches: 0,
            goals: 0,
            assists: 0,
            saves: 0,
            defenses: 0,
            mvp: 0,
            wins: 0,
            draws: 0,
            losses: 0
        };
        
        // 특성 관련
        this.traits = []; // 획득한 특성 ID 목록
        this.equippedTraits = []; // 장착한 특성 (최대 3개)
        
        // 커리어 정보
        this.isCaptain = false;
        this.seasonsAtClub = 0;
        this.formerTeams = [];
        
        // 국가대표
        this.nationalTeam = {
            selected: false,
            militaryExemption: false,
            caps: 0
        };
        
        // 대회 기록
        this.trophies = {
            ucl: 0,
            uel: 0,
            leagueCup: 0,
            superCup: 0,
            cwc: 0,
            league: 0
        };
    }
    
    // 레벨업 (경험치 획득)
    gainExp(amount, reason = "") {
        this.exp += amount;
        
        // 80레벨 이하는 경기 결과로 레벨 변동 없음
        if (this.level < 80 && reason === "match") {
            return;
        }
        
        // 레벨업 체크 (경험치 5당 레벨 1)
        while (this.exp >= 5) {
            this.exp -= 5;
            this.level++;
            ui.showNotification(`⬆️ 레벨 업! 현재 레벨: ${this.level}`);
        }
        
        // 레벨 다운 체크
        while (this.exp < 0 && this.level > 0) {
            this.exp += 30;
            this.level--;
            ui.showNotification(`⬇️ 레벨 다운... 현재 레벨: ${this.level}`);
        }
        
        if (this.exp < 0) this.exp = 0;
        if (this.level < 0) this.level = 0;
    }
    
    // 매일 훈련
    train() {
        if (this.level >= 80) {
            ui.showNotification("⚠️ 80레벨 이상은 훈련으로 레벨을 올릴 수 없습니다.");
            return;
        }
        
        this.gainExp(1, "training");
        game.advanceDay();
        
        ui.showNotification("💪 훈련 완료! 경험치 +1");
        
        // 다음이 경기일인지 체크
        if (game.isMatchDay()) {
            ui.showNotification("⚽ 경기일입니다!");
            setTimeout(() => {
                ui.showNextMatch();
            }, 500);
        } else {
            ui.updateUI();
        }
    }
    
    // 주장 자격 확인
    updateCaptainStatus() {
        const tier = getLeagueTier(this.league);
        
        // 조건 1: 팀 내 최고 레벨 (간단히 레벨 75 이상으로 가정)
        // 조건 2: 2시즌 이상 소속
        if (this.level >= 75 || this.seasonsAtClub >= 2) {
            this.isCaptain = true;
        } else {
            this.isCaptain = false;
        }
    }
    
    // 이적
    transfer(newTeam, newLeague) {
        this.formerTeams.push({
            team: this.team,
            league: this.league,
            seasons: this.seasonsAtClub
        });
        
        this.team = newTeam;
        this.league = newLeague;
        this.seasonsAtClub = 0;
        this.isCaptain = false;
        
        ui.showNotification(`🔄 ${newTeam}로 이적했습니다!`);
    }
    
    // 특성 장착
    equipTrait(traitId) {
        const tier = getLeagueTier(this.league);
        
        if (tier === 1) {
            ui.showNotification("⚠️ 1부 리그에서는 특성을 장착할 수 없습니다.");
            return false;
        }
        
        if (!this.traits.includes(traitId)) {
            ui.showNotification("⚠️ 이 특성을 아직 획득하지 못했습니다.");
            return false;
        }
        
        if (this.equippedTraits.length >= 3) {
            ui.showNotification("⚠️ 최대 3개까지만 장착 가능합니다.");
            return false;
        }
        
        if (this.equippedTraits.includes(traitId)) {
            ui.showNotification("⚠️ 이미 장착한 특성입니다.");
            return false;
        }
        
        this.equippedTraits.push(traitId);
        ui.showNotification(`✅ 특성 "${TRAITS[traitId].name}" 장착 완료!`);
        return true;
    }
    
    // 특성 해제
    unequipTrait(traitId) {
        const index = this.equippedTraits.indexOf(traitId);
        if (index > -1) {
            this.equippedTraits.splice(index, 1);
            ui.showNotification(`특성 "${TRAITS[traitId].name}" 장착 해제`);
            return true;
        }
        return false;
    }
    
    // 저장
    save() {
        const saveData = {
            player: this,
            gameDate: game.currentDate
        };
        localStorage.setItem('careerSave', JSON.stringify(saveData));
    }
    
    // 불러오기
    static load() {
        const saveData = localStorage.getItem('careerSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            const player = Object.assign(new Player(), data.player);
            return { player, gameDate: data.gameDate };
        }
        return null;
    }
}

// 국가대표 선발 체크 (한국 이름만)
function checkNationalTeamSelection(player) {
    // 한국 이름이 아니면 국가대표 대상 아님
    if (!isKoreanName(player.name)) {
        return false;
    }
    
    const age = player.age;
    const level = player.level;
    
    // U-18 (16-18세)
    if (age >= 16 && age <= 18 && level >= 60 && !player.nationalTeam.selected) {
        player.nationalTeam.selected = true;
        ui.showNotification("🇰🇷 U-18 국가대표로 선발되었습니다!");
        return true;
    }
    
    // U-21 (조기 차출 가능)
    if (age >= 18 && age <= 21 && level >= 70) {
        player.nationalTeam.selected = true;
        ui.showNotification("🇰🇷 U-21 국가대표로 선발되었습니다!");
        return true;
    }
    
    // 성인 대표팀 (조기 차출)
    if (level >= 85) {
        player.nationalTeam.selected = true;
        ui.showNotification("🇰🇷 성인 국가대표로 조기 차출되었습니다!");
        return true;
    }
    
    return false;
}

// 병역 특례 체크 (한국 이름만)
function checkMilitaryExemption(tournament, result) {
    // 한국 이름이 아니면 병역 특례 없음
    if (!isKoreanName(game.player.name)) {
        return false;
    }
    
    const conditions = {
        'asianCup': result === 'champion',
        'asianGames': result === 'champion',
        'worldCup': result === 'round16',
        'olympics': result === 'medal'
    };
    
    if (conditions[tournament]) {
        game.player.nationalTeam.militaryExemption = true;
        ui.showNotification("🎖️ 병역 특례 획득!");
        return true;
    }
    return false;
}