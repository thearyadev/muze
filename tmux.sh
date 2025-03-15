#/bin/bash

SESSION_NAME="muze"

if tmux has-session -t $SESSION_NAME 2>/dev/null; then
	echo "Session $SESSION_NAME already exists, killing"
	tmux kill-session -t $SESSION_NAME
fi

tmux new-session -d -s $SESSION_NAME -n "Editor"
tmux split-window -h
sleep 1


tmux send-keys -t $SESSION_NAME:1.1 "nvim" Enter


tmux new-window -t $SESSION_NAME:2 -n "Server"
tmux split-window -h
docker kill muze-db 2>/dev/null
docker rm muze-db 2>/dev/null
tmux send-keys -t $SESSION_NAME:2.2 "./start_database.sh" Enter
tmux send-keys -t $SESSION_NAME:2.1 "npm run dev --legacy-peer-deps" Enter


tmux new-window -t $SESSION_NAME:3 -n "Manifests"
tmux send-keys -t $SESSION_NAME:3.1 "cd ~/manifests/muze" Enter

tmux select-window -t $SESSION_NAME:1
tmux attach-session -t $SESSION_NAME

