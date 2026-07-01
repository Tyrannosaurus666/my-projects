package com.aiagent.service.agent;

import com.aiagent.entity.Agent;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AgentService {

    private final Map<Long, Agent> agents = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(1);

    public Agent createAgent(Agent agent) {
        agent.setId(idGen.getAndIncrement());
        agent.setCreateTime(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        agents.put(agent.getId(), agent);
        return agent;
    }

    public Agent getAgent(Long id) {
        return agents.get(id);
    }

    public List<Agent> getAllAgents() {
        return new ArrayList<>(agents.values());
    }

    public void deleteAgent(Long id) {
        agents.remove(id);
    }
}
