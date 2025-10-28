// match.js - 경기 시뮬레이션 로직

class Match {
    constructor(homeTeam, awayTeam, competition = "리그", isPlayerHome = true) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.competition = competition;
        this.isPlayerHome = isPlayerHome;
        
        this.homeScore = 0;
        this.awayScore = 0;
        
        this.events = [];
        this.playerStats = {
            goals: 0,
            assists: 0,
            saves: 0,
            defenses: 0,
            longShots: 0,
            assistedGoals: 0,
            mvp: false
        };
    }
    
    // 경기 시뮬레이션
    simulate() {
        const player = game.player;
        const playerTeam = this.isPlayerHome ? this.homeTeam : this.awayTeam;
        const opponentTeam = this.isPlayerHome ? this.awayTeam : this.homeTeam;
        
        // 1단계: 팀 전력 계산
        const playerTeamStrength = this.calculateTeamStrength(playerTeam, true);
        const opponentStrength = this.calculateTeamStrength(opponentTeam, false);
        
        // 2단계: 승리 확률 계산
        const strengthDiff = playerTeamStrength - opponentStrength;
        const winProbability = 0.5 + (strengthDiff / 200); // -1~1 범위로 정규화
        
        // 3단계: 경기 이벤트 생성
        this.generateMatchEvents(winProbability);
        
        // 결과 반환
        return this.getResult();
    }
    
    // 팀 전력 계산 (TSI)
    calculateTeamStrength(team, isPlayerTeam) {
        let baseStrength = TEAM_STRENGTH[team] || 80;
        
        if (isPlayerTeam) {
            const player = game.player;
            const tier = getLeagueTier(player.league);
            
            // 3부 리그는 선발 보장 + 기여도 보너스
            if (tier === 3) {
                baseStrength += player.level * 0.25; // 플레이어 기여도 증가
            } else if (tier === 2) {
                baseStrength += player.level * 0.20;
            } else if (tier === 1) {
                baseStrength += player.level * 0.15;
            }
            
            // 특성 보너스 (1부 리그 제외)
            if (tier !== 1) {
                const traitBonus = getTraitBonus(player, {});
                baseStrength += traitBonus;
            }
            
            // 주장 보너스
            if (player.isCaptain) {
                baseStrength += 5;
            }
        }
        
        return baseStrength;
    }
    
    // 경기 이벤트 생성
    generateMatchEvents(winProbability) {
        const player = game.player;
        const tier = getLeagueTier(player.league);
        const playerTeam = this.isPlayerHome ? this.homeTeam : this.awayTeam;
        const opponentTeam = this.isPlayerHome ? this.awayTeam : this.homeTeam;
        
        // 플레이어 기여도 계산 (레벨과 티어에 따라)
        let playerContribution;
        if (tier === 3) {
            playerContribution = 0.35; // 3부 리그 높은 기여도
        } else if (tier === 2) {
            playerContribution = Math.min(player.level / 500, 0.30); // 2부 리그
        } else {
            playerContribution = Math.min(player.level / 800, 0.25); // 1부 리그
        }
        
        // 득점 횟수 결정
        const totalGoals = Math.floor(Math.random() * 5) + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < totalGoals; i++) {
            const minute = Math.floor(Math.random() * 90) + 1;
            const random = Math.random();
            
            // 승리 확률에 따라 득점 팀 결정
            const playerTeamScores = random < winProbability;
            
            if (playerTeamScores) {
                // 플레이어가 득점할 확률
                if (Math.random() < playerContribution && player.position !== 'GK') {
                    this.playerStats.goals++;
                    if (this.isPlayerHome) this.homeScore++;
                    else this.awayScore++;
                    
                    // 어시스트한 선수 (랜덤 팀 동료)
                    const assister = Math.random() < 0.7 ? getRandomTeamPlayer(playerTeam, player) : null;
                    
                    this.events.push({
                        minute: minute,
                        type: 'goal',
                        player: player.name,
                        team: playerTeam,
                        assister: assister ? assister.name : null
                    });
                } else {
                    // 다른 선수가 득점
                    if (this.isPlayerHome) this.homeScore++;
                    else this.awayScore++;
                    
                    const scorer = getRandomTeamPlayer(playerTeam, player);
                    
                    // 플레이어가 어시스트할 확률
                    if (Math.random() < playerContribution * 0.6 && player.position !== 'GK') {
                        this.playerStats.assists++;
                        this.events.push({
                            minute: minute,
                            type: 'goal',
                            player: scorer.name,
                            team: playerTeam,
                            assister: player.name
                        });
                    } else {
                        // 다른 선수가 어시스트
                        const assister = Math.random() < 0.7 ? getRandomTeamPlayer(playerTeam, player) : null;
                        this.events.push({
                            minute: minute,
                            type: 'goal',
                            player: scorer.name,
                            team: playerTeam,
                            assister: assister ? assister.name : null
                        });
                    }
                }
            } else {
                // 상대 팀 득점
                if (this.isPlayerHome) this.awayScore++;
                else this.homeScore++;
                
                const scorer = getRandomTeamPlayer(opponentTeam);
                const assister = Math.random() < 0.7 ? getRandomTeamPlayer(opponentTeam) : null;
                
                this.events.push({
                    minute: minute,
                    type: 'goal',
                    player: scorer.name,
                    team: opponentTeam,
                    assister: assister ? assister.name : null
                });
                
                // 골키퍼일 경우 선방 실패
                if (player.position === 'GK') {
                    this.events.push({
                        minute: minute,
                        type: 'conceded',
                        team: playerTeam
                    });
                }
            }
        }
        
        // 수비 이벤트 (DF, MF, GK)
        if (['DF', 'MF', 'GK'].includes(player.position)) {
            const defenseAttempts = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < defenseAttempts; i++) {
                if (Math.random() < playerContribution) {
                    const minute = Math.floor(Math.random() * 90) + 1;
                    this.playerStats.defenses++;
                    
                    this.events.push({
                        minute: minute,
                        type: player.position === 'GK' ? 'save' : 'defense',
                        player: player.name,
                        team: playerTeam
                    });
                    
                    if (player.position === 'GK') {
                        this.playerStats.saves++;
                    }
                }
            }
        }
        
        // 이벤트 시간순 정렬
        this.events.sort((a, b) => a.minute - b.minute);
    }
    
    // 경기 결과 반환
    getResult() {
        const player = game.player;
        const isPlayerTeamHome = this.isPlayerHome;
        const playerScore = isPlayerTeamHome ? this.homeScore : this.awayScore;
        const opponentScore = isPlayerTeamHome ? this.awayScore : this.homeScore;
        
        let result = 'draw';
        if (playerScore > opponentScore) result = 'win';
        else if (playerScore < opponentScore) result = 'loss';
        
        // MVP 결정 (간단히 활약 포인트로 계산)
        const activityPoints = (this.playerStats.goals * 2) + 
                              (this.playerStats.assists * 1.5) + 
                              (this.playerStats.saves * 1) + 
                              (this.playerStats.defenses * 0.5);
        
        if (activityPoints >= 4 || (this.playerStats.goals >= 2)) {
            this.playerStats.mvp = true;
        }
        
        return {
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            result: result,
            events: this.events,
            playerStats: this.playerStats,
            competition: this.competition
        };
    }
}

// 경기 후 처리
function processMatchResult(matchResult) {
    const player = game.player;
    const stats = matchResult.playerStats;
    
    // 통계 업데이트
    player.stats.matches++;
    player.stats.goals += stats.goals;
    player.stats.assists += stats.assists;
    player.stats.saves += stats.saves;
    player.stats.defenses += stats.defenses;
    
    if (matchResult.result === 'win') player.stats.wins++;
    else if (matchResult.result === 'draw') player.stats.draws++;
    else player.stats.losses++;
    
    if (stats.mvp) player.stats.mvp++;
    
    // 활동 포인트 계산 (레벨 경험치)
    let points = 0;
    const isCWC = matchResult.competition.includes('클럽 월드컵');
    const isSuperCup = matchResult.competition.includes('슈퍼컵');
    
    // 출전
    points += isCWC ? 3 : (isSuperCup ? 3 : 2);
    
    // 승패
    if (matchResult.result === 'win') {
        points += isCWC ? 2 : 2;
    } else if (matchResult.result === 'loss') {
        points -= isCWC ? 1 : 2;
    }
    
    // 골/도움/선방
    const offensivePoints = stats.goals + stats.assists + stats.saves;
    points += offensivePoints * (isCWC ? 1.5 : 1);
    
    // 수비
    points += stats.defenses * (isCWC ? 2.5 : 2);
    
    // MVP
    if (stats.mvp) {
        points += isCWC ? 7 : (isSuperCup ? 5 : 5);
    }
    
    // 레벨 업데이트
    player.gainExp(Math.floor(points), "match");
    
    // 특성 획득 체크
    const newTraits = checkTraitUnlock(stats, player);
    if (newTraits.length > 0) {
        newTraits.forEach(traitId => {
            player.traits.push(traitId);
            // 플레이어에게 알리지 않음 (직접 찾아야 함)
        });
    }
    
    // 날짜 진행
    game.advanceDay();
    
    // 국가대표 선발 체크
    checkNationalTeamSelection(player);
    
    // 주장 자격 업데이트
    player.updateCaptainStatus();
    
    return points;
}

// 대회 생성
function createCompetition(type) {
    const competitions = {
        'league': {
            name: `${game.player.league} 리그전`,
            matches: 10
        },
        'leagueCup': {
            name: '리그컵',
            matches: 5
        },
        'ucl': {
            name: 'UEFA 챔피언스 리그',
            matches: 7
        },
        'uel': {
            name: 'UEFA 유로파 리그',
            matches: 7
        },
        'superCup': {
            name: 'UEFA 슈퍼컵',
            matches: 1
        },
        'cwc': {
            name: 'FIFA 클럽 월드컵',
            matches: 4
        }
    };
    
    return competitions[type] || competitions['league'];
}