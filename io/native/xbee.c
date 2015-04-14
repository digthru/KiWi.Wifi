// compile with 
// gcc -o xbee xbee.c -lxbee -lpthread -lrt

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <xbee.h>
#include <signal.h>
#include <unistd.h>

xbee_err ret;
struct xbee *xbee;
struct xbee_con *con;

void sig_handler(int signal){
    switch(signal) {
	case SIGTERM: 
	case SIGINT: 
        printf("Terminating...\n");
	if ((ret = xbee_conEnd(con)) != XBEE_ENONE) {
		xbee_log(xbee, -1, "xbee_conEnd() returned: %d", ret);
		return;
	}

	xbee_shutdown(xbee);
 	exit(0);
    }
}

void myCB(struct xbee *xbee, struct xbee_con *con, struct xbee_pkt **pkt, void **data) {
	if ((*pkt)->dataLen > 0) {
		if ((*pkt)->data[0] == '@') {
			xbee_conCallbackSet(con, NULL, NULL);
			printf("*** DISABLED CALLBACK... ***\n");
		}
		printf("%s\n", (*pkt)->data);
	}
}

int main(int count, char ** args) {
	
	if(count < 2) return;
	
	signal(SIGINT, sig_handler);
	signal(SIGTERM, sig_handler);

	struct xbee_conAddress address;

	if ((ret = xbee_setup(&xbee, "xbeeZB", "/dev/ttyAMA0", 9600)) != XBEE_ENONE) {
		printf("ret: %d (%s)\n", ret, xbee_errorToStr(ret));
		return ret;
	}

	memset(&address, 0, sizeof(address));
	address.addr64_enabled = 1;
	address.addr64[0] = 0x00;
	address.addr64[1] = 0x13;
	address.addr64[2] = 0xA2;
	address.addr64[3] = 0x00;
	address.addr64[4] = 0x40;
	address.addr64[5] = 0xB2;
	address.addr64[6] = 0x20;
	address.addr64[7] = 0x2F;

	if ((ret = xbee_conNew(xbee, &con, "Data", &address)) != XBEE_ENONE) {
		xbee_log(xbee, -1, "xbee_conNew() returned: %d (%s)", ret, xbee_errorToStr(ret));
		return ret;
	}

	if ((ret = xbee_conDataSet(con, xbee, NULL)) != XBEE_ENONE) {
		xbee_log(xbee, -1, "xbee_conDataSet() returned: %d", ret);
		return ret;
	}

	if ((ret = xbee_conCallbackSet(con, myCB, NULL)) != XBEE_ENONE) {
		xbee_log(xbee, -1, "xbee_conCallbackSet() returned: %d", ret);
		return ret;
	}
	
	// append line-endings
	strcat(args[1], "\r\n");

	ret = xbee_conTx(con, NULL, args[1]);
	
	for (;;) {
		usleep(50000);
	}

	return 0;
}
