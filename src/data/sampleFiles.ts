import { SampleFile } from '../types/index.ts';

export const SAMPLE_FILES: SampleFile[] = [
  {
    id: 'decode-process-data',
    filename: 'process_data.py',
    language: 'python',
    title: 'DecodeLabs Slide Benchmark (process_data.py)',
    description: 'Exact reference snippet from Slide 7 & 13 with scope errors and unhandled None references.',
    targetBugs: [
      "'transform' function not defined in scope",
      "Unhandled AttributeError when item.active is evaluated on None or dict",
      "Missing PEP 484 type hints and docstring",
      "Memory accumulation vulnerability in unbounded result list"
    ],
    code: `def process_data(data):
    # This is a comment
    result = []
    for item in data:
        if item.active:
            result.append(transform(item))
    return result
`
  },
  {
    id: 'auth-jwt-handler',
    filename: 'auth_handler.ts',
    language: 'typescript',
    title: 'Auth Pipeline Token Validator',
    description: 'JWT verification middleware with race conditions, missing expiration check, and credential logging.',
    targetBugs: [
      "Token expiry (exp) claim ignored during signature verification",
      "Potential timing attack vulnerability on string comparison",
      "Plaintext bearer token printed to server logs",
      "Unhandled Promise rejection causing server process termination"
    ],
    code: `import jwt from 'jsonwebtoken';

export async function verifyUserSession(authHeader: string, db: any) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  console.log("Decoding raw user token:", token);

  // Parse token without verifying expiration
  const decoded: any = jwt.decode(token);
  
  // Unhandled async query failure
  const user = await db.users.find({ id: decoded.userId });
  
  if (user && user.role == "admin") {
    return { authorized: true, user };
  }
  return { authorized: false };
}
`
  },
  {
    id: 'order-service-concurrency',
    filename: 'OrderService.java',
    language: 'java',
    title: 'Order Processing Transaction Service',
    description: 'Java enterprise service prone to deadlock, resource leak, and unhandled NullPointerExceptions.',
    targetBugs: [
      "Potential synchronization deadlock between inventoryLock and paymentLock",
      "Unclosed JDBC Connection and Statement leaking DB connection pool",
      "Unchecked NullPointerException on getCartItems()",
      "Missing rollback handling in catch block"
    ],
    code: `public class OrderService {
    private final Object inventoryLock = new Object();
    private final Object paymentLock = new Object();

    public boolean processOrder(Order order, Connection conn) {
        synchronized (inventoryLock) {
            synchronized (paymentLock) {
                // Inverted lock hierarchy risk
                for (Item item : order.getCartItems()) {
                    if (item.getPrice() > 0) {
                        try {
                            Statement stmt = conn.createStatement();
                            stmt.executeUpdate("UPDATE inventory SET qty = qty - 1 WHERE id = " + item.getId());
                            // Statement never closed
                        } catch (Exception e) {
                            System.out.println("Failed: " + e.getMessage());
                        }
                    }
                }
            }
        }
        return true;
    }
}
`
  },
  {
    id: 'worker-pool-leak',
    filename: 'worker_pool.go',
    language: 'go',
    title: 'Async Worker Queue & Dispatcher',
    description: 'Go routine channel worker with routine leak and deadlock when channel buffer saturates.',
    targetBugs: [
      "Goroutine leak: workers never exit when jobs channel is closed",
      "Unbuffered channel causes blocking deadlock when dispatcher writes faster than consumption",
      "Missing context.Context cancellation propagation",
      "Data race accessing shared errorCounter without sync/atomic"
    ],
    code: `package main

import (
	"fmt"
	"time"
)

var errorCount int

func StartWorkers(jobs chan int, numWorkers int) {
	for w := 1; w <= numWorkers; w++ {
		go func(id int) {
			for j := range jobs {
				if j%2 == 0 {
					errorCount++ // Data race: concurrent unsynchronized writes
				}
				fmt.Printf("worker %d processed job %d\\n", id, j)
				time.Sleep(50 * time.Millisecond)
			}
		}(w)
	}
}
`
  },
  {
    id: 'memory-pool-cpp',
    filename: 'memory_manager.cpp',
    language: 'cpp',
    title: 'High-Throughput Packet Buffer',
    description: 'C++ manual memory manager with use-after-free, double delete, and missing virtual destructor.',
    targetBugs: [
      "Use-after-free vulnerability: buffer pointer accessed after delete[]",
      "Double-free bug when calling cleanup() multiple times",
      "Missing virtual destructor on base class causing undefined behavior",
      "Out-of-bounds pointer arithmetic without capacity bounds check"
    ],
    code: `#include <iostream>
#include <cstring>

class PacketBuffer {
public:
    char* data;
    size_t size;

    PacketBuffer(size_t s) {
        size = s;
        data = new char[size];
    }

    ~PacketBuffer() {
        delete[] data;
    }

    void append(const char* chunk, size_t len) {
        // Unchecked buffer overflow
        memcpy(data + size, chunk, len);
    }

    void freeEarly() {
        delete[] data;
        // Dangling pointer left un-nulled
    }
};
`
  }
];
