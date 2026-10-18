# whop_korea_version

한국의 whop 웹페이지 제작.

코드를 저장소로 옮기는 방법

git add . 
git commit -m "작업 내용 한 줄 설명"
git push

해당 방법이 오류가 난다면 해결방법

git push -u origin HEAD

저장 상태 확인 방법
git status        # 저장 안 된 변경 확인
git log --oneline -5   # 최근 커밋 확인

편리하게 저장하는 방법

echo 'alias save="git add . && git commit -m \"wip: $(date +%F_%H:%M)\" && git push"' >> ~/.bashrc
source ~/.bashrc