package net.gestures;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;


import java.util.List;

public interface GestureService {

    @SqlQuery("select * from player order by player_id desc")
    @RegisterBeanMapper(Player.class)
    List<Player> getPlayers();

    @SqlUpdate("insert into player (player_name, player_age) values (?,?)")
    void addPlayer(String playerName,int playerAge);
}
