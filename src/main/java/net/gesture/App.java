package net.gesture;

import com.google.gson.Gson;
import net.gesture.GestureMLService;
import net.gesture.Player;
import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.sqlobject.SqlObjectPlugin;
import spark.ModelAndView;
import spark.template.handlebars.HandlebarsTemplateEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static spark.Spark.*;

public class App {

    public static String render(Map<String, Object> model, String templatePath) {
        return new HandlebarsTemplateEngine().render(new ModelAndView(model, templatePath));
    }

    public static void main(String[] args) {

        port(getHerokuAssignedPort());

        String dbURL = "jdbc:postgresql:GestureMLDB";

        Jdbi jdbi = Jdbi.create(dbURL, "Macgyver", "Christian9432");
        jdbi.installPlugin(new SqlObjectPlugin());

        staticFiles.location("/public"); // Static files

        Gson gson = new Gson();

        get("/", (request, response) -> {
            response.redirect("/api/add/player");
            return null;
        });

        get("/api/scoreboard", (req, res) -> {

            List<Player> playerList = jdbi.withHandle(h -> {
                GestureMLService gestureMLService = h.attach(GestureMLService.class);
                return gestureMLService.getPlayers();
            });

            Map<String,Object> map = new HashMap<>();
            map.put("playerList", playerList);

            return render(map, "scoreboard.handlebars");

        });

        get("/api/add/player", (req, res) -> {

            Map paramsMap = new HashMap();
            return render(paramsMap, "index.handlebars");

        });

        post("/api/add/player", (req, res) -> {

            String name = req.queryParams("name");

            int age = Integer.parseInt(req.queryParams("age"));



            jdbi.useHandle(h -> {
                GestureMLService chocolateService = h.attach(GestureMLService.class);
                chocolateService.addPlayer(name, age);
            });

            res.redirect("/");
            return null;
        });

        get("/api/play", (req, res) -> {
            Map<String, Object> model = new HashMap<>();
            return render(model, "gesture.handlebars" );
        });
    }

    static int getHerokuAssignedPort() {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get("PORT") != null) {
            return Integer.parseInt(processBuilder.environment().get("PORT"));
        }
        return 4567; //return default port if heroku-port isn't set (i.e. on localhost)
    }
}
