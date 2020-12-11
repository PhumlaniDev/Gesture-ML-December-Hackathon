package net.move;

import com.google.gson.Gson;
import org.jdbi.v3.core.ConnectionException;
import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.sqlobject.SqlObjectPlugin;
import spark.ModelAndView;
import spark.template.handlebars.HandlebarsTemplateEngine;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static spark.Spark.*;

public class App {

    static int getHerokuAssignedPort() {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get("PORT") != null) {
            return Integer.parseInt(processBuilder.environment().get("PORT"));
        }
        return 4567; //return default port if heroku-port isn't set (i.e. on localhost)
    }

    static Jdbi getJdbiDatabaseConnection(String defaultJdbcUrl) throws URISyntaxException, SQLException {
        ProcessBuilder processBuilder = new ProcessBuilder();
        String database_url = processBuilder.environment().get("DATABASE_URL");
        if (database_url != null) {

            URI uri = new URI(database_url);
            String[] hostParts = uri.getUserInfo().split(":");
            String username = hostParts[0];
            String password = hostParts[1];
            String host = uri.getHost();

            int port = uri.getPort();

            String path = uri.getPath();
            String url = String.format("jdbc:postgresql://%s:%s%s", host, port, path);

            return Jdbi.create(url, username, password);
        }

        return Jdbi.create(defaultJdbcUrl);

    }

    public static String render(Map<String, Object> model, String templatePath) {
        return new HandlebarsTemplateEngine().render(new ModelAndView(model, templatePath));
    }

    public static void main(String[] args) {

       try {
           port(getHerokuAssignedPort());

           String dbURL = "jdbc:postgresql://localhost/GestureMLDB?user=konvi-dev&password=coder123";

           Jdbi jdbi = getJdbiDatabaseConnection(dbURL);
           jdbi.installPlugin(new SqlObjectPlugin());

           staticFiles.location("/public"); // Static files

           Gson gson = new Gson();

           get("/", (request, response) -> {
               response.redirect("/index");
               return null;
           });

           get("/index", (req, res) -> {
               Map paramsMap = new HashMap();
               return render(paramsMap, "index.handlebars");
           });


           post("/add/player", (req, res) -> {
               String name = req.queryParams("name");
               int age = Integer.parseInt(req.queryParams("age"));
               System.out.println(name);
               System.out.println(age);

               jdbi.useHandle(h -> {
                   GestureService gestureService = h.attach(GestureService.class);
                   gestureService.addPlayer(name, age);
               });

               res.redirect("/start");
               return null;
           });

           get("/start", (req, res) -> {
               Map<String, Object> model = new HashMap<>();
               return render(model, "start.handlebars" );
           });

           get("/scoreboard", (req, res) -> {
               Map<String,Object> map = new HashMap<>();
               try{
                   List<Player> playerList = jdbi.withHandle(h -> {
                       GestureService gestureMLService = h.attach(GestureService.class);
                       return gestureMLService.getPlayers();
                   });
                   map.put("playerList", playerList);
               }catch (ConnectionException  e){
                   e.printStackTrace();
               }

               return render(map, "scoreboard.handlebars");
           });

       }catch (SQLException | ConnectionException | URISyntaxException e){
           e.printStackTrace();
       }

    }


}
