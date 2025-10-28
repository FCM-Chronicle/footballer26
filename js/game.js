// game.js - 메인 게임 로직

const game = {
    player: null,
    currentDate: new Date('2026-01-01'),
    season: 1,
    nextMatchDate: null,
    transferTargets: null, // 이적 명단 저장
    isTransferWindow: false, // 이적 시장 오픈 여부
    
    // 게임 초기화
    init() {
        console.log('게임 초기화 중...');
        
        // 전체 리그 선수단 초기화
        if (!window.allSquads) {
            console.log('선수단 생성 중...');
            window.allSquads = initializeAllSquads();
            console.log('선수단 생성 완료:', Object.keys(window.allSquads).length, '팀');
        }
        
        // 저장된 데이터 불러오기
        const savedData = Player.load();
        if (savedData) {
            this.player = savedData.player;
            this.currentDate = new Date(savedData.gameDate);
            this.season = savedData.season || 1;
            this.nextMatchDate = savedData.nextMatchDate ? new Date(savedData.nextMatchDate) : null;
            this.transferTargets = savedData.transferTargets || null;
            this.isTransferWindow = savedData.isTransferWindow || false;
            console.log('저장된 데이터 로드 완료');
            ui.updateUI();
        }
        
        // 등록 폼 이벤트 리스너
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerPlayer();
            });
        }
        
        // 자동 저장 (5분마다)
        setInterval(() => {
            if (this.player) {
                this.save();
                console.log('자동 저장 완료');
            }
        }, 300000);
    },
    
    // 경기일 체크
    isMatchDay() {
        if (!this.nextMatchDate) {
            // 첫 경기일 설정 (등록 후 3일 뒤)
            this.scheduleNextMatch();
            return false;
        }
        
        return this.currentDate.getTime() >= this.nextMatchDate.getTime();
    },
    
    // 다음 경기 일정 잡기 (3일마다)
    scheduleNextMatch() {
        this.nextMatchDate = new Date(this.currentDate);
        this.nextMatchDate.setDate(this.nextMatchDate.getDate() + 3);
    },
    
    // 선수 등록
    registerPlayer() {
        const name = document.getElementById('playerNameInput').value;
        const position = document.getElementById('positionInput').value;
        const number = parseInt(document.getElementById('numberInput').value);
        const team = document.getElementById('teamInput').value;
        
        if (!name || !position || !number || !team) {
            ui.showNotification('모든 정보를 입력해주세요!');
            return;
        }
        
        // 팀이 속한 리그 찾기
        const league = getTeamLeague(team);
        if (!league) {
            ui.showNotification('유효하지 않은 팀입니다!');
            return;
        }
        
        // 플레이어 생성
        this.player = new Player(name, position, number, team);
        
        // UI 업데이트
        ui.closeModal('registrationModal');
        ui.showNotification(`환영합니다, ${name}!`);
        ui.updateUI();
        
        // 환영 메시지
        const tier = getLeagueTier(league);
        const tierName = tier === 1 ? '1부' : tier === 2 ? '2부' : '3부';
        
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="section">
                <div class="section-title">🎉 등록 완료!</div>
                <p style="font-size: 1.1em; line-height: 1.6;">
                    <strong>${name}</strong>님, ${team}에 오신 것을 환영합니다!<br><br>
                    
                    <strong>시작 정보:</strong><br>
                    • 포지션: ${position}<br>
                    • 등번호: ${number}번<br>
                    • 레벨: ${this.player.level} / 300<br>
                    • 나이: ${this.player.age}세<br>
                    • 소속 리그: ${league} (${tierName}부 리그)<br><br>
                    
                    ${tier === 3 ? '<strong>3부 리그에서는 무조건 선발 출전이 보장됩니다!</strong><br>' : ''}
                    매일 훈련하고 경기에서 활약하여 레벨을 올리세요!
                </p>
                
                <div class="news-item" style="margin-top: 20px;">
                    <div class="news-source">[ JS스포츠 ]</div>
                    <p>"${team}에 새로운 유망주 ${name} 영입... 
                    ${position} 포지션에서 기대를 모으고 있다"</p>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="ui.showTraining()">첫 훈련 시작</button>
                    <button class="btn btn-secondary" onclick="ui.showNextMatch()">첫 경기 준비</button>
                </div>
            </div>
        `;
        
        // 저장
        this.player.save();
    },
    
    // 날짜 진행
    advanceDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        
        // 생일 체크 (1월 1일)
        if (this.currentDate.getMonth() === 0 && this.currentDate.getDate() === 1) {
            this.player.age++;
            ui.showNotification(`🎂 생일 축하합니다! ${this.player.age}세가 되었습니다.`);
        }
        
        // 시즌 체크 (7월 1일에 새 시즌)
        if (this.currentDate.getMonth() === 6 && this.currentDate.getDate() === 1) {
            this.season++;
            this.player.seasonsAtClub++;
            ui.showNotification(`⚽ 새로운 시즌이 시작되었습니다! (시즌 ${this.season})`);
            
            // 주장 자격 업데이트
            this.player.updateCaptainStatus();
        }
        
        // 랜덤 이벤트 (낮은 확률로 이적 오퍼 등)
        if (Math.random() < 0.05) {
            this.triggerRandomEvent();
        }
        
        // 저장
        if (this.player) {
            this.player.save();
        }
    },
    
    // 랜덤 이벤트
    triggerRandomEvent() {
        const events = [
            {
                condition: () => this.player.level >= 70,
                message: () => {
                    const teams = ['맨체스터 시티', '레알 마드리드', '바르셀로나', 'PSG'];
                    const team = teams[Math.floor(Math.random() * teams.length)];
                    return `[ 오피샬리송 ] "${team}가 ${this.player.name}에 관심... 이적 시장에서 핫한 이름으로 떠올라"`;
                }
            },
            {
                condition: () => this.player.stats.goals >= 20,
                message: () => `[ JS스포츠 ] "${this.player.name}, 시즌 ${this.player.stats.goals}골 돌파... '득점 머신'으로 불려"`
            },
            {
                condition: () => this.player.stats.mvp >= 5,
                message: () => `[ 오피샬리송 ] "MVP ${this.player.stats.mvp}회 수상한 ${this.player.name}, 리그 최고의 선수 중 한 명"`
            },
            {
                condition: () => true,
                message: () => `[ JS스포츠 ] "${this.player.team} 팬들, ${this.player.name}에 열광... '우리 팀의 미래'"`
            }
        ];
        
        const possibleEvents = events.filter(e => e.condition());
        if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'news-item';
                notification.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    max-width: 300px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                `;
                notification.innerHTML = `
                    <div class="news-source">뉴스</div>
                    <p style="font-size: 0.9em;">${event.message()}</p>
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 5000);
            }, 1000);
        }
    },
    
    // 대회 참가
    enterTournament(tournamentType) {
        const tier = getLeagueTier(this.player.league);
        
        // 참가 자격 체크
        if (tournamentType === 'ucl' && tier !== 'tier1') {
            ui.showNotification('⚠️ UCL은 1부 리그 상위 4팀만 참가할 수 있습니다.');
            return;
        }
        
        const competition = createCompetition(tournamentType);
        ui.showNotification(`🏆 ${competition.name}에 참가합니다!`);
        
        // 대회 진행 (간단히 구현)
        // 실제로는 여러 경기를 진행해야 함
    },
    
    // 새 게임 시작
    newGame() {
        if (confirm('현재 진행 중인 게임이 삭제됩니다. 계속하시겠습니까?')) {
            localStorage.removeItem('careerSave');
            this.player = null;
            this.currentDate = new Date('2026-01-01');
            this.season = 1;
            location.reload();
        }
    },
    
    // 저장
    save() {
        if (this.player) {
            const saveData = {
                player: this.player,
                gameDate: this.currentDate,
                season: this.season,
                nextMatchDate: this.nextMatchDate,
                transferTargets: this.transferTargets,
                isTransferWindow: this.isTransferWindow
            };
            localStorage.setItem('careerSave', JSON.stringify(saveData));
        }
    },
    
    // 게임 저장
    saveGame() {
        this.save();
        ui.showNotification('💾 게임이 저장되었습니다!');
    }
};

// 페이지 로드 시 게임 초기화
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});

// 개발자 도구용 치트 (개발 중에만 사용)
window.cheat = {
    levelUp(amount = 10) {
        if (game.player) {
            game.player.gainExp(amount * 10, "cheat");
            ui.updateUI();
            console.log(`레벨 ${amount} 상승`);
        }
    },
    unlockAllTraits() {
        if (game.player) {
            for (let traitId in TRAITS) {
                if (!game.player.traits.includes(parseInt(traitId))) {
                    game.player.traits.push(parseInt(traitId));
                }
            }
            ui.showNotification('모든 특성 획득!');
            console.log('모든 특성 해금됨');
        }
    },
    addGoals(amount = 10) {
        if (game.player) {
            game.player.stats.goals += amount;
            ui.updateUI();
            console.log(`골 ${amount}개 추가`);
        }
    }
};