#include "Connection.h"

Connection::Connection(const Device& d, unsigned at)
    : device(d.clone()), connectedAt(at) {}

Connection::Connection(const Connection& other)
    : device(other.device->clone()), connectedAt(other.connectedAt) {}

Connection& Connection::operator=(const Connection& other) {
    if (this != &other) {
        Device* copy = other.device->clone();  // copy first for exception safety
        delete device;
        device = copy;
        connectedAt = other.connectedAt;
    }
    return *this;
}

Connection::~Connection() {
    delete device;
}
