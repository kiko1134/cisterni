#include "Server.h"
#include "MobileDevice.h"
#include "DesktopDevice.h"

#include <iostream>

int main() {
    std::cout << "=== Create server (capacity=2, timeout=5) ===\n";
    Server server(2, 5);

    MobileDevice phone("Phone1", 87);
    DesktopDevice pc("PC1", "192.168.0.1");

    std::cout << "connect Phone1 : " << std::boolalpha << server.connect(phone) << '\n';
    std::cout << "connect PC1    : " << server.connect(pc) << '\n';

    // Third connection must be rejected (server is full).
    MobileDevice tablet("Tablet1", 50);
    std::cout << "connect Tablet1: " << server.connect(tablet) << " (expected false)\n\n";

    server.print();

    std::cout << "\n=== saveLog -> state.log ===\n";
    server.saveLog("state.log");

    std::cout << "\n=== tick(5): both connections (age=5 >= timeout) expire ===\n";
    server.tick(5);
    server.print();

    std::cout << "\n=== loadLog <- state.log (restore previous state) ===\n";
    server.loadLog("state.log");
    server.print();

    std::cout << "\n=== disconnect device with the desktop's ID ===\n";
    server.disconnect(pc.getId());
    server.print();

    std::cout << "\n=== tick(3) then tick(2): the mobile expires at total age 5 ===\n";
    server.tick(3);
    server.print();
    server.tick(2);
    server.print();

    return 0;
}
