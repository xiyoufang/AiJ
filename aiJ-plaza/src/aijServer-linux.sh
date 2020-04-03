#!/bin/bash

# shell exec directory
SHELL_DIR=$(cd "$(dirname "$0")";pwd)
# shell exec arguments
opt="${@:2}"

echo "shell dir: $SHELL_DIR, arguments:$opt"

# main class
MAIN_CLASS=com.xiyoufang.aij.plaza.PlazaAiJStarter

# class path
CLASSPATH=

for i in "$SHELL_DIR"/lib/*.jar; do
   CLASSPATH="$CLASSPATH":"$i"
done

#JAVA_OPTS="-Xms256m -Xmx1024m -Xmn512m -Djava.awt.headless=true"

JAVA_OPTS="-Djava.awt.headless=true $opt"

# process id
p_id=

# check process
check_pid() {
   p_id=`ps -efwww | grep ${MAIN_CLASS} | grep -v 'grep' | awk '{print $2}' | tr '\n' ' '`
   echo "aij server process id: $p_id"
}

start() {
     echo "starting..."
     check_pid

      if [[ ${p_id} -ne 0 ]]; then
         echo "================================"
         echo "warn: $MAIN_CLASS already started! (process id=$p_id)"
         echo "================================"
      else
         echo "=========== Start ============"
         echo "JAVA_HOME: $JAVA_HOME"
         echo "SERVER HOME $SHELL_DIR"
         echo "Starting ..."

         JAVA_CMD="$JAVA_HOME/bin/java $JAVA_OPTS -classpath $CLASSPATH $MAIN_CLASS"
         mkdir -p ${SHELL_DIR}/logs/
         nohup ${JAVA_CMD} > ${SHELL_DIR}/logs/console.log 2>&1 &
         sleep 8
         check_pid
         if [[ ${p_id} -ne 0 ]]; then
            echo "Server started successfully!"
         else
            echo "Server started failed!"
         fi
     fi
}

stop() {
   check_pid
    if [[ ${p_id} -ne 0 ]]; then

       echo "Killing pid -> "${p_id}
       kill -9 ${p_id}
       echo "$MAIN_CLASS stopped successfully."
   else
      echo "================================"
      echo "warn: Server is not running!"
      echo "================================"
   fi

}

status() {
   check_pid

   if [[ ${p_id} -ne 0 ]];  then
      echo "Server is running!"
   else
      echo "Server is not running!"
   fi
}

echo "Running $1 command as $USER"

case "$1" in
   'start')
      start
      ;;
   'stop')
     stop
     ;;
   'restart')
     stop
     start
     ;;
   'status')
     status
     ;;
  *)
     echo "Usage: $0 {start|stop|restart|status}"
     exit 1
esac
exit 0
