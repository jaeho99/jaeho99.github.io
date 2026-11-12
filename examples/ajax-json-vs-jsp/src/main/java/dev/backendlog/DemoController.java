package dev.backendlog;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.json.MappingJackson2JsonView;

@Controller
public class DemoController {
    @GetMapping("/")
    public String index() { return "index"; }

    @GetMapping("/demo/broken")
    public String broken(Model model) {
        model.addAttribute("message", "hello");
        return "result";
    }

    @GetMapping(value = "/demo/body", produces = "application/json")
    @ResponseBody
    public Map<String, Object> body() { return payload(); }

    @GetMapping("/demo/named-view")
    public ModelAndView namedView() { return new ModelAndView("jsonView", payload()); }

    @GetMapping("/demo/direct-view")
    public ModelAndView directView() { return new ModelAndView(new MappingJackson2JsonView(), payload()); }

    private Map<String, Object> payload() {
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("message", "hello");
        return data;
    }
}

