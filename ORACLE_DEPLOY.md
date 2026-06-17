# Oracle Cloud에서 진짜 링킷 실행

GitHub 저장소:

```text
https://github.com/jun41n/Linkit
```

서버에서 실행할 앱 포트:

```text
8031
```

## 서버 접속 후 실행

```bash
git clone https://github.com/jun41n/Linkit.git
cd Linkit
bash oracle-start.sh
```

## 노트북 접속 주소

Oracle 서버 공인 IP가 `YOUR_ORACLE_IP`라면:

```text
http://YOUR_ORACLE_IP:8031/
```

Oracle Cloud 보안 목록 또는 방화벽에서 TCP `8031`을 열어야 합니다.
