# Oracle Cloud 진짜 링킷 배포

현재 Oracle Cloud 서버에서 진짜 링킷이 실행 중입니다.

## 접속 주소

```text
http://158.179.162.39:8031/
```

## 서버 정보

```text
서버 이름: linkit-8031
포트: 8031
GitHub: https://github.com/jun41n/Linkit
SSH 사용자: opc
SSH 키: C:\Users\jun41\.ssh\linkit_8031_oracle
```

## 서버 안에서 확인

```bash
sudo systemctl status linkit
curl -I http://127.0.0.1:8031/
```

## 다시 시작

```bash
sudo systemctl restart linkit
```

## 새 버전 반영

로컬에서 수정 후 GitHub에 올리고, Oracle 서버의 `/opt/linkit`을 최신 코드로 바꾼 다음 다시 시작합니다.

```bash
sudo systemctl restart linkit
```

Oracle Cloud 보안 목록과 서버 방화벽에는 TCP `8031`이 열려 있어야 합니다.
