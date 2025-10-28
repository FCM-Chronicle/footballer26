// ui.js - UI 업데이트 및 상호작용

const ui = {
    // UI 전체 업데이트
    updateUI() {
        if (!game.player) return;
        
        const player = game.player;
        
        // 플레이어 카드 업데이트
        document.getElementById('playerName').innerHTML = 
            `${player.name} ${player.isCaptain ? '<span class="captain-badge">[ 주장 ]</span>' : ''}`;
        
        const playerInfo = document.getElementById('playerInfo');
        playerInfo.innerHTML = `
            <div class="info-item">
                <span class="info-label">레벨:</span> 
                <span class="level-badge">${player.level}</span>
            </div>
            <div class="info-item">
                <span class="info-label">나이:</span> ${player.age}세
            </div>
            <div class="info-item">
                <span class="info-label">포지션:</span> ${player.position}
            </div>
            <div class="info-item">
                <span class="info-label">등번호:</span> ${player.number}번
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">소속:</span> ${player.team}
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">리그:</span> ${player.league}
            </div>
        `;
        
        // 날짜 업데이트
        const date = new Date(game.currentDate);
        document.getElementById('gameDate').textContent = 
            `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    },
    
    // 알림 표시
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // 모달 열기
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // 모달 닫기
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    // 선수 등록 화면
    showRegistration() {
        // 3부 리그 팀 목록 로드
        const starterTeams = getStarterTeams();
        const teamSelect = document.getElementById('teamInput');
        teamSelect.innerHTML = '<option value="">선택하세요</option>';
        
        // 리그별로 그룹화
        const leagueGroups = {};
        starterTeams.forEach(item => {
            if (!leagueGroups[item.league]) {
                leagueGroups[item.league] = [];
            }
            leagueGroups[item.league].push(item.team);
        });
        
        // 옵션 추가
        for (let league in leagueGroups) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = league;
            leagueGroups[league].forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                optgroup.appendChild(option);
            });
            teamSelect.appendChild(optgroup);
        }
        
        this.openModal('registrationModal');
    },
    
    // 훈련 화면
    showTraining() {
        if (!game.player) {
            this.showNotification("먼저 선수를 등록해주세요!");
            return;
        }
        
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="section">
                <div class="section-title">💪 매일 훈련</div>
                <p style="font-size: 1.1em; margin-bottom: 20px;">
                    매일 훈련으로 실력을 키우세요!<br>
                    <small style="color: #666;">* 80레벨 미만까지만 훈련으로 레벨업 가능합니다.</small><br>
                    <small style="color: #666;">* 경험치 30당 레벨 1 상승</small>
                </p>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${game.player.level}</div>
                        <div class="stat-label">현재 레벨</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${game.player.exp}/30</div>
                        <div class="stat-label">경험치</div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="game.player.train()">훈련하기</button>
                </div>
            </div>
        `;
    },
    
    // 다음 경기
    showNextMatch() {
        if (!game.player) {
            this.showNotification("먼저 선수를 등록해주세요!");
            return;
        }
        
        // 경기일이 아니면 경기 불가
        if (!game.isMatchDay()) {
            const daysUntil = Math.ceil((game.nextMatchDate - game.currentDate) / (1000 * 60 * 60 * 24));
            this.showNotification(`⚠️ 경기일이 아닙니다! ${daysUntil}일 후 경기 예정`);
            return;
        }
        
        const opponent = getRandomOpponent(game.player.team, game.player.league);
        
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="section">
                <div class="section-title">⚽ 다음 경기</div>
                <div class="match-result">
                    <h3 style="text-align: center; margin-bottom: 20px;">${game.player.league} 리그전</h3>
                    <div class="score">
                        ${game.player.team} vs ${opponent}
                    </div>
                    <p style="text-align: center; color: #666; margin-top: 10px;">
                        홈 경기 • ${new Date(game.currentDate).toLocaleDateString('ko-KR')}
                    </p>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="ui.playMatch('${opponent}', 'league')">경기 시작</button>
                </div>
            </div>
        `;
    },
    
    // 경기 진행
    playMatch(opponent, competition = 'league') {
        const match = new Match(game.player.team, opponent, competition, true);
        const result = match.simulate();
        
        this.showMatchResult(result);
        
        const points = processMatchResult(result);
        
        // 다음 경기 일정 잡기
        game.scheduleNextMatch();
        
        this.updateUI();
    },
    
    // 경기 결과 표시
    showMatchResult(result) {
        const stats = result.playerStats;
        
        let eventLog = '';
        result.events.forEach(event => {
            let icon = '⚽';
            let text = '';
            
            switch(event.type) {
                case 'goal':
                    icon = '⚽';
                    if (event.assister) {
                        text = `${event.minute}' - <strong>${event.player}</strong> 골! (도움: ${event.assister})`;
                    } else {
                        text = `${event.minute}' - <strong>${event.player}</strong> 골!`;
                    }
                    break;
                case 'assist':
                    icon = '🎯';
                    text = `${event.minute}' - ${event.player} 어시스트!`;
                    break;
                case 'save':
                    icon = '🧤';
                    text = `${event.minute}' - <strong>${event.player}</strong> 선방!`;
                    break;
                case 'defense':
                    icon = '🛡️';
                    text = `${event.minute}' - <strong>${event.player}</strong> 수비 성공!`;
                    break;
                case 'conceded':
                    icon = '⚠️';
                    text = `${event.minute}' - 실점`;
                    break;
            }
            
            eventLog += `<div class="event-item">${icon} ${text}</div>`;
        });
        
        const resultText = result.result === 'win' ? '승리 🎉' : 
                          result.result === 'draw' ? '무승부' : '패배 😢';
        
        const modalContent = document.getElementById('matchContent');
        modalContent.innerHTML = `
            <h2 style="margin-bottom: 20px;">경기 결과</h2>
            <div class="match-result">
                <h3 style="text-align: center;">${result.competition}</h3>
                <div class="score">
                    ${result.homeTeam} ${result.homeScore} - ${result.awayScore} ${result.awayTeam}
                </div>
                <h2 style="text-align: center; color: ${result.result === 'win' ? '#4caf50' : result.result === 'draw' ? '#ff9800' : '#f44336'}; margin-top: 15px;">
                    ${resultText}
                </h2>
            </div>
            
            <div class="section">
                <div class="section-title">${game.player.name}의 활약</div>
                <div class="stats-grid">
                    <div class="stat-box" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <div class="stat-value">${stats.goals}</div>
                        <div class="stat-label">골</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <div class="stat-value">${stats.assists}</div>
                        <div class="stat-label">어시스트</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                        <div class="stat-value">${stats.saves}</div>
                        <div class="stat-label">선방</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <div class="stat-value">${stats.defenses}</div>
                        <div class="stat-label">수비</div>
                    </div>
                </div>
                ${stats.mvp ? '<p style="text-align: center; font-size: 1.3em; margin-top: 15px;">🏆 <strong>MAN OF THE MATCH</strong></p>' : ''}
            </div>
            
            <div class="section">
                <div class="section-title">경기 하이라이트</div>
                <div class="event-log">
                    ${eventLog || '<p style="text-align: center; color: #999;">기록된 이벤트가 없습니다.</p>'}
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-success" onclick="ui.closeModal('matchModal')">확인</button>
            </div>
        `;
        
        this.openModal('matchModal');
    },
    
    // 이적 시장
    showTransfer() {
        if (!game.player) {
            this.showNotification("먼저 선수를 등록해주세요!");
            return;
        }
        
        // 이적 시장이 열려있지 않으면 차단
        if (!game.isTransferWindow) {
            this.showNotification("⚠️ 이적 시장이 닫혀있습니다! 시즌 종료 후 다시 시도하세요.");
            const content = document.getElementById('contentArea');
            content.innerHTML = `
                <div class="section">
                    <div class="section-title">🔒 이적 시장 닫힘</div>
                    <p style="font-size: 1.1em; text-align: center; padding: 40px;">
                        이적 시장은 시즌 종료 후 (7월 1일 ~ 7월 31일)에만 열립니다.<br>
                        현재는 시즌 중이므로 이적이 불가능합니다.
                    </p>
                </div>
            `;
            return;
        }
        
        const tier = getLeagueTier(game.player.league);
        
        // 명단이 없으면 새로 생성
        if (!game.transferTargets) {
            game.transferTargets = getTransferTargets(game.player.level, tier);
        }
        
        const targets = game.transferTargets;
        
        let transferList = '';
        if (targets.length === 0) {
            transferList = '<p style="text-align: center; color: #666; padding: 20px;">현재 레벨로는 이적 가능한 팀이 없습니다. 더 레벨을 올려보세요!</p>';
        } else {
            targets.forEach((target, index) => {
                const tierName = target.tier === 1 ? '1부 리그' : target.tier === 2 ? '2부 리그' : '3부 리그';
                transferList += `
                    <div class="match-result" style="cursor: pointer;" onclick="ui.attemptTransfer('${target.team}', '${target.league}', ${index})">
                        <h4>${target.team}</h4>
                        <p style="color: #666;">${target.league} (${tierName})</p>
                        <p style="color: #999; font-size: 0.9em;">팀 전력: ${target.strength} | 호환성: ${target.compatibility}%</p>
                        <p style="color: #667eea; font-weight: bold; margin-top: 10px;">역오퍼 보내기 →</p>
                    </div>
                `;
            });
        }
        
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="section">
                <div class="section-title">🔄 이적 시장 (열림)</div>
                <p style="margin-bottom: 20px;">
                    현재 레벨: <strong>${game.player.level}</strong><br>
                    소속: <strong>${game.player.team}</strong> (${game.player.league})<br>
                    <small style="color: #666;">* 역오퍼를 보내면 새로운 명단이 생성됩니다</small>
                </p>
                <h3 style="margin: 20px 0 10px 0;">이적 가능한 팀</h3>
                ${transferList}
            </div>
        `;
    },
    
    // 이적 시도
    attemptTransfer(team, league, index) {
        const success = Math.random() < 0.6; // 60% 성공률
        
        if (success) {
            // Fabrizio Romano 뉴스
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'news-item';
                notification.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    max-width: 350px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                `;
                notification.innerHTML = `
                    <div class="news-source" style="color: white; font-weight: bold;">[ Fabrizio Romano ]</div>
                    <p style="font-size: 0.95em; color: white;">
                        "${game.player.name} to ${team}, HERE WE GO! 
                        ${game.player.team}에서 ${team}로 이적 확정. 
                        계약 완료. ✅🔴🔵"
                    </p>
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 6000);
            }, 500);
            
            game.player.transfer(team, league);
            
            // 이적 후 명단 갱신
            game.transferTargets = null;
            
            this.showNotification(`✅ ${team}로 이적 성공!`);
            this.updateUI();
            this.showTransfer();
        } else {
            // 이적 실패 후 명단 갱신
            const tier = getLeagueTier(game.player.league);
            game.transferTargets = getTransferTargets(game.player.level, tier);
            
            this.showNotification(`❌ ${team}에서 역오퍼를 거절했습니다.`);
            this.showTransfer();
        }
    },
    
    // 통계 보기
    showStats() {
        if (!game.player) {
            this.showNotification("먼저 선수를 등록해주세요!");
            return;
        }
        
        const player = game.player;
        const stats = player.stats;
        
        // 특성 목록
        let traitsList = '';
        if (player.traits.length === 0) {
            traitsList = '<p style="color: #999;">아직 획득한 특성이 없습니다.</p>';
        } else {
            player.traits.forEach(traitId => {
                const trait = TRAITS[traitId];
                const isEquipped = player.equippedTraits.includes(traitId);
                traitsList += `
                    <span class="trait-badge" style="background: ${isEquipped ? '#4caf50' : '#9e9e9e'};">
                        ${trait.name} ${isEquipped ? '✓' : ''}
                    </span>
                `;
            });
        }
        
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="section">
                <div class="section-title">📊 선수 통계</div>
                
                <h3 style="margin: 20px 0 10px 0;">커리어 기록</h3>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${stats.matches}</div>
                        <div class="stat-label">경기 출전</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.goals}</div>
                        <div class="stat-label">골</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.assists}</div>
                        <div class="stat-label">어시스트</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.saves}</div>
                        <div class="stat-label">선방</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.defenses}</div>
                        <div class="stat-label">수비</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.mvp}</div>
                        <div class="stat-label">MVP</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);">
                        <div class="stat-value">${stats.wins}</div>
                        <div class="stat-label">승리</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);">
                        <div class="stat-value">${stats.draws}</div>
                        <div class="stat-label">무승부</div>
                    </div>
                    <div class="stat-box" style="background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);">
                        <div class="stat-value">${stats.losses}</div>
                        <div class="stat-label">패배</div>
                    </div>
                </div>
                
                <h3 style="margin: 20px 0 10px 0;">획득한 특성 (${player.traits.length}개)</h3>
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    ${traitsList}
                </div>
                
                <h3 style="margin: 20px 0 10px 0;">국가대표</h3>
                <div class="info-item">
                    <span class="info-label">선발 여부:</span> 
                    ${player.nationalTeam.selected ? '✅ 선발됨' : '❌ 미선발'}
                </div>
                <div class="info-item">
                    <span class="info-label">병역 특례:</span> 
                    ${player.nationalTeam.militaryExemption ? '✅ 획득' : '❌ 미획득'}
                </div>
            </div>
        `;
    }
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .btn-block {
        width: 100%;
        margin: 5px 0;
    }
`;
document.head.appendChild(style);