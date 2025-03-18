#/bin/bash

SESSION_NAME="muze"

if tmux has-session -t $SESSION_NAME 2>/dev/null; then
	echo "Session $SESSION_NAME already exists, killing"
	tmux attach-session -t $SESSION_NAME
else 
	tmux new-session -d -s $SESSION_NAME -n "Editor"
	tmux split-window -h
	sleep 1



	tmux send-keys -t $SESSION_NAME:1.1 "nvim" Enter Space "sf"
	tmux send-keys -t $SESSION_NAME:1.2 "git status" Enter


	tmux new-window -t $SESSION_NAME:2 -n "Server"
	tmux split-window -h
	docker kill muze-db 2>/dev/null
	docker rm muze-db 2>/dev/null
	tmux send-keys -t $SESSION_NAME:2.2 "./start_database.sh" Enter
	sleep 1
	tmux send-keys -t $SESSION_NAME:2.1 "pnpm drizzle-kit migrate" Enter
	tmux send-keys -t $SESSION_NAME:2.1 "pnpm dev" Enter
        tmux split-window -v -t $SESSION_NAME:2.2
	IP=$(ip addr show ens18 | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
	tmux send-keys -t $SESSION_NAME:2.3 "pnpm drizzle-kit studio --host $IP" Enter

	tmux new-window -t $SESSION_NAME:3 -n "Manifests"
	tmux send-keys -t $SESSION_NAME:3.1 "cd ~/manifests/muze" Enter
	tmux send-keys -t $SESSION_NAME:3.1 "nvim manifest.yaml" Enter
	tmux split-window -h -t $SESSION_NAME:3.1
	tmux send-keys -t $SESSION_NAME:3.2 "cd ~/manifests/muze" Enter

	tmux select-window -t $SESSION_NAME:1
	tmux select-pane -t 1
	tmux attach-session -t $SESSION_NAME
fi


