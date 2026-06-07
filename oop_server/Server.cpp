#include "Server.h"
#include "MobileDevice.h"
#include "DesktopDevice.h"

#include <fstream>
#include <iostream>
#include <string>

Server::Server(unsigned cap, unsigned to)
    : connections(new Connection*[cap]),
      count(0),
      capacity(cap),
      timeout(to),
      currentTime(0) {}

Server::~Server() {
    clear();
    delete[] connections;
}

void Server::clear() {
    for (unsigned i = 0; i < count; ++i) {
        delete connections[i];
    }
    count = 0;
}

void Server::removeAt(unsigned i) {
    delete connections[i];
    for (unsigned j = i + 1; j < count; ++j) {
        connections[j - 1] = connections[j];  // shift left, no holes
    }
    --count;
}

bool Server::connect(const Device& d) {
    if (count >= capacity) {
        return false;  // server is full -> reject the device
    }
    connections[count++] = new Connection(d, currentTime);
    return true;
}

void Server::disconnect(int deviceID) {
    for (unsigned i = 0; i < count; ++i) {
        if (connections[i]->getDevice().getId() == deviceID) {
            removeAt(i);
            return;
        }
    }
}

void Server::tick(unsigned cnt) {
    currentTime += cnt;

    // Keep only the connections that have not reached the timeout threshold.
    unsigned write = 0;
    for (unsigned read = 0; read < count; ++read) {
        unsigned age = currentTime - connections[read]->getConnectedAt();
        if (age >= timeout) {
            delete connections[read];          // expired -> terminate
        } else {
            connections[write++] = connections[read];
        }
    }
    count = write;
}

void Server::saveLog(const char* filename) const {
    std::ofstream out(filename);
    if (!out) {
        std::cerr << "Server: cannot open '" << filename << "' for writing\n";
        return;
    }
    for (unsigned i = 0; i < count; ++i) {
        const Device& d = connections[i]->getDevice();
        // <device_type> <device_id> <device_name> <type_specific_fields> <connected_at>
        out << d.type() << ' '
            << d.getId() << ' '
            << d.getName() << ' ';
        d.writeFields(out);
        out << ' ' << connections[i]->getConnectedAt() << '\n';
    }
}

void Server::loadLog(const char* filename) {
    std::ifstream in(filename);
    if (!in) {
        std::cerr << "Server: cannot open '" << filename << "' for reading\n";
        return;
    }

    clear();  // replace the current state

    std::string type;
    while (in >> type) {
        if (type == "mobile") {
            int id, battery;
            std::string name;
            unsigned at;
            if (!(in >> id >> name >> battery >> at)) break;
            MobileDevice d(id, name, battery);
            if (count < capacity) {
                connections[count++] = new Connection(d, at);
            }
        } else if (type == "desktop") {
            int id;
            std::string name, url;
            unsigned at;
            if (!(in >> id >> name >> url >> at)) break;
            DesktopDevice d(id, name, url);
            if (count < capacity) {
                connections[count++] = new Connection(d, at);
            }
        } else {
            // Unknown type token: skip the rest of the line defensively.
            std::string rest;
            std::getline(in, rest);
        }
    }
}

void Server::print() const {
    std::cout << "Server [time=" << currentTime
              << ", connections=" << count << "/" << capacity
              << ", timeout=" << timeout << "]\n";
    for (unsigned i = 0; i < count; ++i) {
        std::cout << "  - connected_at=" << connections[i]->getConnectedAt()
                  << " | ";
        connections[i]->getDevice().print();
    }
}
