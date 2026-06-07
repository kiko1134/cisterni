#ifndef CONNECTION_H
#define CONNECTION_H

#include "Device.h"

// Information about a successful session between a device and the server.
// The Connection OWNS its device (manages its memory) and supports correct
// (deep) copying. A Connection can only be created by the Server.
class Connection {
    Device* device;        // owned copy of the connected device
    unsigned connectedAt;  // tick at which the connection was established

    // Creating a connection is the server's responsibility only.
    Connection(const Device& d, unsigned at);
    friend class Server;

public:
    // Correct copy semantics (deep copy of the owned device).
    Connection(const Connection& other);
    Connection& operator=(const Connection& other);
    ~Connection();

    const Device& getDevice() const { return *device; }
    unsigned getConnectedAt() const { return connectedAt; }
};

#endif // CONNECTION_H
